# Enable Banking API Integration (Backend)

## Context

GoCardless Bank Account Data stopped accepting new signups in July 2025. Users who self-host Kontor cannot connect their bank accounts. **Enable Banking** is the replacement — free "restricted mode" where each self-hosting user registers their own EB app and links their own accounts. 2,500+ European banks, 180-day sessions, simple REST API with JWT auth.

Individual `TransactionRecord` rows (like legacy) are the right approach — they enable per-transaction categorization, statistics/aggregation, search/filter, and future recurring detection.

**Scope: Backend only.** Models, API client, controllers, jobs, endpoints. Frontend in a follow-up.

## Design Decisions

- **Enable Banking only** — no GoCardless abstraction. Legacy stays on `legacy` branch.
- **Per-user credentials** — each self-hosting user provides their own `app_id` + PEM key. Stored encrypted in DB (AR encryption, keys in Rails credentials).
- **JWT auth per request** — no token refresh. Generate RS256 JWT client-side with `jwt` gem.
- **Signed amounts** — EB returns positive amounts + `credit_debit_indicator`. We store signed (negative = debit).
- **6-hour sync interval** — 4 syncs/day, within PSD2 background rate limit.
- **Callback URL from request** — use `request.base_url` to derive callback URL dynamically. Works on localhost, private network, or public domain. The callback is a browser redirect (like OAuth), so no public exposure needed.
- **Default categories on signup** — create locale-aware default categories (DE/EN) when user signs up, like legacy.
- **Testing: WebMock over VCR** — VCR cassettes would contain real EB credentials and bank data. WebMock stubs are self-contained, no data leakage. Mock at the HTTP boundary (Client specs) or at the Client instance level (controller/job specs). Keep tests small.

## Testing Strategy

| Layer | Approach | What's tested |
|---|---|---|
| **Models** | No mocking. Factories + direct assertions | Validations, key behavior |
| **API Client** | WebMock HTTP stubs | Correct URLs, JWT in headers, JSON parsing, error handling |
| **Controllers** | Mock `EnableBanking::Client` instance (not HTTP) | Request/response contracts, auth, error paths |
| **Jobs** | Mock `EnableBanking::Client` instance | Sync logic, upsert/dedup, amount signing |
| **Data APIs** | No mocking. Factories to create records | Filtering, pagination, JSON structure |

---

## Phase 1: Models & Migrations ✅ DONE

All 5 tables created, models with validations/associations/scopes, factories, specs. 36 specs passing.

**What exists now:**
- `app/models/category.rb` — belongs_to :user, validates name uniqueness per user, normalizes name
- `app/models/enable_banking_credential.rb` — belongs_to :user, encrypts :private_key_pem
- `app/models/bank_connection.rb` — belongs_to :user, has_many :accounts, status enum (pending/authorized/expired/error), `active?`/`expired?` methods, `authorized`/`active` scopes
- `app/models/account.rb` — belongs_to :bank_connection, has_many :transaction_records, `display_name` fallback
- `app/models/transaction_record.rb` — belongs_to :account, optional :category, scopes (debits/credits/booked/in_period/uncategorized)
- `app/models/user.rb` — has associations to all above, `create_default_categories!(locale:)` with 17 DE/EN categories
- `Gemfile` — `jwt` gem added, `webmock` gem added (test group)
- AR encryption configured in Rails credentials for `private_key_pem`
- Factories: `spec/factories/` — one per model with useful traits (:pending, :expired, :error, :credit)
- Specs: `spec/models/` — one per model, small focused tests

**Schema (see `db/schema.rb` for full details):**
- `categories` — user_id (FK), name. Unique index `[user_id, name]`
- `enable_banking_credentials` — user_id (FK, unique), app_id, private_key_pem (encrypted)
- `bank_connections` — user_id (FK), institution_id, institution_name, country_code, authorization_id, session_id (unique), status, valid_until, last_synced_at, error_message
- `accounts` — bank_connection_id (FK), account_uid, identification_hash, iban, name, currency, account_type, balance_amount, balance_type, balance_updated_at, last_synced_at
- `transaction_records` — account_id (FK), category_id (FK, nullable), transaction_id, amount, currency, booking_date, value_date, status, remittance, creditor_name/iban, debtor_name/iban, bank_transaction_code, entry_reference. Unique index `[account_id, transaction_id]`

---

## Phase 2: Enable Banking API Client ✅ DONE

7 specs passing (1 JWT generator + 6 client). Uses Net::HTTP stdlib, no extra gems beyond `jwt`.

**What exists now:**
- `app/services/enable_banking/jwt_generator.rb` — RS256 JWT with `kid: app_id`, `iss: "enablebanking.com"`, `aud: "api.enablebanking.com"`, 1h TTL. Fresh token per call.
- `app/services/enable_banking/client.rb` — HTTP wrapper for `https://api.enablebanking.com`:
  - `list_aspsps(country:)`, `start_authorization(aspsp:, state:, redirect_url:, valid_until:)`, `create_session(code:)`, `get_session(session_id:)`, `delete_session(session_id:)`, `account_details(account_uid:)`, `account_balances(account_uid:)`, `account_transactions(account_uid:, date_from:, date_to:, continuation_key:)`
  - Error classes: `EnableBanking::ApiError` (status + body), `EnableBanking::RateLimitError` (429)
- `spec/support/enable_banking_helpers.rb` — shared EB API response fixtures (aspsps, auth, session, balances, transactions). Included globally via `RSpec.configure`. Reused in Phase 3+4 specs.
- `spec/services/enable_banking/jwt_generator_spec.rb` — 1 test
- `spec/services/enable_banking/client_spec.rb` — 6 tests (GET+auth, POST, DELETE, pagination, 429, 500)

### Enable Banking API reference:
- Base URL: `https://api.enablebanking.com`
- Auth: Bearer JWT (RS256, kid=app_id, iss="enablebanking.com", aud="api.enablebanking.com", max 24h TTL)
- `GET /aspsps?country=XX` — list banks
- `POST /auth` — body: `{access: {valid_until}, aspsp: {name, country}, state, redirect_url, psu_type}` → returns `{url, authorization_id}`
- `POST /sessions` — body: `{code}` → returns `{session_id, accounts: [{uid, identification_hash, ...}], access: {valid_until}}`
- `GET /sessions/:id` — session details
- `DELETE /sessions/:id` — terminate session
- `GET /accounts/:uid/details` — account metadata
- `GET /accounts/:uid/balances` — returns `{balances: [{balance_amount: {amount, currency}, balance_type}]}`
- `GET /accounts/:uid/transactions?date_from=&date_to=&continuation_key=` — returns `{transactions: [{transaction_id, transaction_amount: {amount, currency}, credit_debit_indicator, booking_date, value_date, creditor: {name}, creditor_account: {iban}, debtor: {name}, debtor_account: {iban}, remittance_information: [...], status, entry_reference}], continuation_key}`
- Amounts are always positive — use `credit_debit_indicator` ("CRDT"/"DBIT") for sign
- `remittance_information` is an array of strings — join with space
- Pagination via `continuation_key` — loop until null
- Rate limits from banks: ~4 requests/day/account in background mode
- HTTP 429 → `ASPSP_RATE_LIMIT_EXCEEDED`

---

## Phase 3: Controllers & Routes ← START HERE

### New files:
- `app/controllers/api/v1/enable_banking_credentials_controller.rb` — show/create/update
- `app/controllers/api/v1/aspsps_controller.rb` — index (list banks by country)
- `app/controllers/api/v1/bank_connections_controller.rb` — index/show/create/callback/destroy/sync
- `app/controllers/api/v1/categories_controller.rb` — index/create/update/destroy
- `spec/requests/api/v1/` — one spec per controller

### Modify:
- `config/routes.rb` — add:
  ```ruby
  resource :enable_banking_credential, only: [:show, :create, :update]
  resources :aspsps, only: [:index]
  resources :bank_connections, only: [:index, :show, :create, :destroy] do
    member { get :callback; post :sync }
  end
  resources :categories, only: [:index, :create, :update, :destroy]
  resource :dashboard, only: [:show]
  ```
- `app/controllers/api/v1/accounts_controller.rb` — replace stub with real data
- `app/controllers/api/v1/transactions_controller.rb` — replace stub with filtered, paginated data

### Callback flow:
1. `POST /api/v1/bank_connections` → creates pending record, calls EB `/auth`, returns `{redirect_url}`
2. User authenticates at bank → browser redirected to `GET /api/v1/bank_connections/:id/callback?code=XXX`
3. Callback calls EB `/sessions`, updates connection (authorized), creates Account records, enqueues `SyncAccountsJob`
4. Redirects browser to `/?bank_connection_success=:id`

Callback URL derived from `request.base_url`.

---

## Phase 4: Background Sync Jobs

### New files:
- `app/jobs/sync_accounts_job.rb` — for a single BankConnection:
  - Skip if not active (mark expired if needed)
  - Per account: fetch balances, fetch transactions (continuation_key pagination loop)
  - Upsert via `find_or_initialize_by(transaction_id:)`
  - Sign amounts: negate when `credit_debit_indicator == "DBIT"`
  - Join `remittance_information` array with space
  - Incremental: `date_from` = last tx booking_date - 2 days. Initial: 90 days back.
  - `retry_on RateLimitError, wait: 6.hours, attempts: 3`
- `app/jobs/sync_all_accounts_job.rb` — enqueues per-connection jobs for all active connections
- `config/recurring.yml` — `SyncAllAccountsJob` every 6 hours
- `spec/jobs/` — one spec per job

---

## Phase 5: Data API Endpoints

### Modify:
- `app/controllers/api/v1/accounts_controller.rb` — return accounts with bank_connection info, balances
- `app/controllers/api/v1/transactions_controller.rb` — filtering (account_id, category_id, date range, search text, uncategorized), pagination (page/per params)

### New files:
- `app/controllers/api/v1/dashboard_controller.rb` — total_balance, income/expenses this month, transaction count, recent 5 transactions
- `spec/requests/api/v1/` — one spec per endpoint

---

## Verification

1. `bundle exec rspec` — all specs green
2. Rails console: `EnableBanking::Client.new(app_id: "...", private_key_pem: "...").list_aspsps(country: "DE")`
3. Manual callback flow if EB sandbox available
4. `GET /api/v1/transactions?from=2026-01-01&to=2026-02-06` returns paginated results
5. `GET /api/v1/dashboard` returns aggregated data

---

## Future Phases (not in scope)

- Frontend React components for all pages
- `GeminiCategorizer` service for AI-powered transaction categorization
- `RecurringTransactionDetector` for recurring payment detection
- Statistics and charting
