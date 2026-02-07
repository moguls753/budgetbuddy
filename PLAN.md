# Bank Account Integration (Backend)

## Context

Two open banking providers, both supported:

- **Enable Banking** — free "restricted mode," each self-hosting user registers their own EB app. 2,500+ European ASPSPs (mostly Nordic/Baltic, limited German coverage). 180-day sessions, REST API with JWT auth.
- **GoCardless Bank Account Data** (formerly Nordigen) — stopped accepting new signups July 2025, but existing accounts still work. Broader European coverage including smaller banks (e.g. Tomorrow/Solaris). OAuth2 API with global app credentials.

Both providers write to the same `Account` and `TransactionRecord` tables. The `BankConnection` model has a `provider` column to dispatch to the right client.

**Scope: Backend only.** Models, API client, controllers, jobs, endpoints. Frontend in a follow-up.

## Legacy GoCardless Code — What's Wrong

The `legacy` branch has a working GoCardless integration. We're porting it, not copying it. Problems:

1. **Faraday dependency** — extra gem for simple HTTP. EB client uses Net::HTTP stdlib. GC should too.
2. **`allocate` + `instance_variable_set` hack** — `Client.new_without_token` bypasses `initialize` to make unauthenticated token requests. Terrible. Token fetching should be a separate concern.
3. **12 rate limit columns on Account** — ephemeral HTTP header data stored as business data. Don't persist it. Log it if needed.
4. **`Agreement` as separate model** — overkill for optional GoCardless metadata. Just a column on BankConnection.
5. **`GoCardlessToken` singleton** — `first_or_initialize` pattern with `fetch_new_token!` / `refresh!` mutating the same row. Works but fragile. Token lifecycle belongs inside the credential model.
6. **`category` as string on TransactionRecord** — already fixed in Phase 1 with proper FK to `categories` table.
7. **Scraper types on BankConnection** — `barclays_scraper`, `scalable_capital_scraper`, etc. We don't need scrapers.
8. **Hardcoded localhost URL** in SyncAccountsJob when re-creating requisitions.
9. **No per-account error isolation in sync** — one account failure kills the whole job.

## Design Decisions

- **Dual provider** — Enable Banking + GoCardless. `provider` column on `BankConnection` dispatches to the right client/sync logic.
- **Per-user credentials for both** — EB: `app_id` + PEM key. GC: `secret_id` + `secret_key`. Both stored encrypted in DB per user.
- **GoCardless token lifecycle in credential model** — `GoCardlessCredential` stores both the app credentials AND the OAuth2 tokens (access/refresh + expiry timestamps). No separate token table, no `allocate` hack.
- **Net::HTTP for both clients** — no Faraday. Consistent with EB client, zero extra dependencies.
- **Signed amounts** — EB returns positive amounts + `credit_debit_indicator`, we negate DBIT. GoCardless returns pre-signed amounts, stored as-is.
- **6-hour sync interval** — 4 syncs/day, within PSD2 background rate limit.
- **Callback URL from request** — `request.base_url` for both providers. Works on localhost, private network, or public domain.
- **Default categories on signup** — locale-aware defaults (DE/EN) when user signs up.
- **Testing: WebMock over VCR** — no real credentials in test fixtures. Mock at HTTP boundary (client specs) or client instance level (controller/job specs).

## Testing Strategy

| Layer | Approach | What's tested |
|---|---|---|
| **Models** | No mocking. Factories + direct assertions | Validations, key behavior |
| **API Clients** | WebMock HTTP stubs | Correct URLs, auth headers, JSON parsing, error handling |
| **Controllers** | Mock client instances (not HTTP) | Request/response contracts, auth, error paths |
| **Jobs** | Mock client instances | Sync logic, upsert/dedup, amount signing, provider dispatch |
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

7 specs passing (1 JWT generator + 6 client). Uses Net::HTTP stdlib, no extra gems beyond `jwt`. Verified end-to-end against EB sandbox (list_aspsps works). Requires Ruby 3.4.8+ (OpenSSL 3.6 CRL fix).

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

## Phase 2b: GoCardless Provider ✅ DONE

12 specs passing (6 credential model + 6 client). Net::HTTP like EB, no Faraday. Token lifecycle in credential model (no separate token table, no `allocate` hack). Verified end-to-end against real GoCardless API (1,118 German institutions, Tomorrow Bank found).

**What exists now:**
- `app/models/go_cardless_credential.rb` — belongs_to :user, encrypts all 4 fields (secret_id, secret_key, access_token, refresh_token). Token lifecycle: `ensure_valid_token!` → `fetch_new_token!` or `refresh!`, called by client constructor.
- `app/services/go_cardless/client.rb` — Net::HTTP wrapper for `https://bankaccountdata.gocardless.com/api/v2`. Public token endpoints (`obtain_token`, `refresh_token`) called by credential model. Error classes: `GoCardless::ApiError`, `GoCardless::RateLimitError`.
- `app/models/bank_connection.rb` — added `provider` enum (`enable_banking`, `gocardless`)
- `spec/support/go_cardless_helpers.rb` — shared GC response fixtures (institutions, requisition, balances, transactions, token responses)
- Migration: `provider` column (default "enable_banking"), `requisition_id`, `link` on bank_connections. `go_cardless_credentials` table.

### Migration:
- Add `provider` (string, not null, default "enable_banking") to `bank_connections`
- Add `requisition_id` (string, nullable) to `bank_connections`
- Add `link` (string, nullable) to `bank_connections`
- Create `go_cardless_credentials` table: `user_id` (FK, unique), `secret_id` (string, encrypted, not null), `secret_key` (string, encrypted, not null), `access_token` (text, encrypted), `refresh_token` (text, encrypted), `access_expires_at` (datetime), `refresh_expires_at` (datetime)

### New files:
- `app/models/go_cardless_credential.rb` — belongs_to :user, encrypts :secret_id/:secret_key/:access_token/:refresh_token. Token lifecycle: `ensure_valid_token!`, `access_expired?`, `refresh_valid?`, `fetch_new_token!(client:)`, `refresh!(client:)`. The credential manages its own token state.
- `app/services/go_cardless/client.rb` — Net::HTTP wrapper for `https://bankaccountdata.gocardless.com/api/v2`:
  - `list_institutions(country:)`, `create_requisition(institution_id:, redirect:)`, `get_requisition(requisition_id:)`, `account_balances(account_id:)`, `account_transactions(account_id:, date_from:, date_to:)`, `account_details(account_id:)`
  - Token management: constructor takes a `GoCardlessCredential`, calls `ensure_valid_token!` before first request
  - Error classes: `GoCardless::ApiError`, `GoCardless::RateLimitError` (429)
  - No Faraday. No `allocate` hack. Clean Net::HTTP like EB client.
- `spec/support/go_cardless_helpers.rb` — shared GC API response fixtures
- `spec/services/go_cardless/client_spec.rb` — WebMock tests (same pattern as EB: GET, POST, token refresh, 429, 500)
- `spec/models/go_cardless_credential_spec.rb`
- `spec/factories/go_cardless_credentials.rb`

### Modify:
- `app/models/bank_connection.rb` — add `provider` enum (`enable_banking`, `gocardless`), provider-specific validations (`session_id` required for EB, `requisition_id` required for GC)
- `app/models/user.rb` — add `has_one :go_cardless_credential`
- Update BankConnection factory with provider trait

### GoCardless API reference:
- Base URL: `https://bankaccountdata.gocardless.com/api/v2`
- Auth: Bearer access_token (OAuth2, obtained via `POST /token/new/` with `{secret_id, secret_key}`)
- Token refresh: `POST /token/refresh/` with `{refresh}` → new access_token
- Access token TTL: ~24h. Refresh token TTL: ~30 days.
- `GET /institutions/?country=XX` — list banks
- `POST /requisitions/` — body: `{institution_id, redirect}` → returns `{id, link, status}`
- `GET /requisitions/:id/` — returns `{id, status, accounts: [account_id_strings]}`
- `GET /accounts/:id/balances/` — returns `{balances: [{balanceAmount: {amount, currency}, balanceType}]}`
- `GET /accounts/:id/transactions/?date_from=&date_to=` — returns `{transactions: {booked: [...], pending: [...]}}`
- `GET /accounts/:id/details/` — returns `{account: {iban, currency, ownerName, ...}}`
- Amounts are **pre-signed** (negative = debit). No indicator field needed.
- Transaction ID field: `internalTransactionId`
- Remittance: `remittanceInformationUnstructured` (single string, not array)
- Rate limits: ~4 requests/day/account in background mode
- HTTP 429 → rate limited

### Key differences from EB handled in sync (Phase 4):

| | Enable Banking | GoCardless |
|---|---|---|
| Amount signing | Positive + `credit_debit_indicator` → negate DBIT | Pre-signed, store as-is |
| Transaction ID | `transaction_id` | `internalTransactionId` |
| Remittance | `remittance_information` (array, join) | `remittanceInformationUnstructured` (string) |
| Account ID | `account_uid` (from session) | `account_id` (from requisition) |
| Tx response | Flat list with `status` field | Split `{booked: [], pending: []}` |

---

## Phase 3: Controllers & Routes ✅ DONE

20 specs passing (5 credentials + 3 institutions + 6 bank_connections + 6 categories). Both providers supported in create/callback flows. Credential check before connection save (no orphaned records). Duplicate credential guard (409 Conflict). Stub `SyncAccountsJob` for Phase 4.

**What exists now:**
- `app/controllers/api/v1/credentials_controller.rb` — show (both providers' status), create (with duplicate guard), update. Provider param dispatches to EB or GC credential model.
- `app/controllers/api/v1/institutions_controller.rb` — list banks by country+provider. Mocks client in specs.
- `app/controllers/api/v1/bank_connections_controller.rb` — full dual-provider flow: create (checks credentials first, then saves, then calls provider API), callback (EB code→session / GC requisition→accounts), destroy (cleans up EB session), sync (enqueues job). Error params in callback handled.
- `app/controllers/api/v1/categories_controller.rb` — CRUD scoped to current user.
- `app/jobs/sync_accounts_job.rb` — stub, Phase 4 fills in logic.
- `config/routes.rb` — credentials, institutions, bank_connections (with callback/sync members), categories, dashboard.

### New files:
- `app/controllers/api/v1/credentials_controller.rb` — show/create/update for BOTH provider types. Single endpoint, provider param determines which credential model.
- `app/controllers/api/v1/institutions_controller.rb` — index (list banks by country). Dispatches to EB or GC client based on which credentials the user has configured (or `provider` param).
- `app/controllers/api/v1/bank_connections_controller.rb` — index/show/create/callback/destroy/sync. Create and callback dispatch to the right provider.
- `app/controllers/api/v1/categories_controller.rb` — index/create/update/destroy
- `spec/requests/api/v1/` — one spec per controller

### Modify:
- `config/routes.rb` — add:
  ```ruby
  resource :credentials, only: [:show, :create, :update]
  resources :institutions, only: [:index]
  resources :bank_connections, only: [:index, :show, :create, :destroy] do
    member { get :callback; post :sync }
  end
  resources :categories, only: [:index, :create, :update, :destroy]
  resource :dashboard, only: [:show]
  ```

### Callback flows:

**Enable Banking:**
1. `POST /api/v1/bank_connections` with `{provider: "enable_banking", institution_id, ...}` → creates pending record, calls EB `/auth`, returns `{redirect_url}`
2. User authenticates at bank → browser redirected to `GET /api/v1/bank_connections/:id/callback?code=XXX`
3. Callback calls EB `/sessions`, updates connection (authorized), creates Account records, enqueues `SyncAccountsJob`
4. Redirects browser to `/?bank_connection_success=:id`

**GoCardless:**
1. `POST /api/v1/bank_connections` with `{provider: "gocardless", institution_id, ...}` → creates pending record, calls GC `create_requisition`, returns `{redirect_url: link}`
2. User authenticates at bank → browser redirected to `GET /api/v1/bank_connections/:id/callback?ref=REQUISITION_ID`
3. Callback calls GC `get_requisition`, updates connection (authorized), creates Account records from requisition account list, enqueues `SyncAccountsJob`
4. Redirects browser to `/?bank_connection_success=:id`

---

## Phase 4: Background Sync Jobs ✅ DONE

4 specs passing. Dual-provider dispatch, amount signing, dedup, incremental sync, expiry guard. Error classes extracted to own files for Zeitwerk autoloading. Status field converted to enum.

**What exists now:**
- `app/jobs/sync_accounts_job.rb` — per BankConnection: skips non-authorized, marks expired EB connections, dispatches by provider. EB: continuation_key pagination, signs amounts (negate DBIT), joins remittance array. GC: fetches account details when missing, pre-signed amounts. Both: upserts via `find_or_initialize_by(transaction_id:)`, updates balances, incremental sync (last booking_date - 2 days, initial 90 days). `retry_on RateLimitError` for both providers.
- `app/jobs/sync_all_accounts_job.rb` — enqueues `SyncAccountsJob` for each active connection
- `config/recurring.yml` — `SyncAllAccountsJob` every 6 hours
- `app/services/{enable_banking,go_cardless}/{api_error,rate_limit_error}.rb` — extracted from client files for Zeitwerk
- `app/models/bank_connection.rb` — `status` converted to enum (gives `authorized?`, `pending?`, `expired?`, `error?` for free), `active` scope handles GC nil `valid_until`
- `spec/jobs/sync_accounts_job_spec.rb` — 4 tests (EB signed amounts, GC pre-signed amounts, dedup, expired skip)

---

## Phase 5: Data API Endpoints ← START HERE

Provider-agnostic. All data comes from the same tables regardless of provider.

### Modify:
- `app/controllers/api/v1/accounts_controller.rb` — return accounts with bank_connection info (including provider), balances
- `app/controllers/api/v1/transactions_controller.rb` — filtering (account_id, category_id, date range, search text, uncategorized), pagination (page/per params)

### New files:
- `app/controllers/api/v1/dashboard_controller.rb` — total_balance, income/expenses this month, transaction count, recent 5 transactions
- `spec/requests/api/v1/` — one spec per endpoint

---

## Verification

1. `bundle exec rspec` — all specs green
2. Rails console: `EnableBanking::Client.new(app_id: "...", private_key_pem: "...").list_aspsps(country: "DE")`
3. Rails console: `GoCardless::Client.new(credential).list_institutions(country: "DE")`
4. Manual callback flow for both providers
5. `GET /api/v1/transactions?from=2026-01-01&to=2026-02-06` returns paginated results from both providers
6. `GET /api/v1/dashboard` returns aggregated data across both providers

---

## Future Phases (not in scope)

- Frontend React components for all pages
- `GeminiCategorizer` service for AI-powered transaction categorization
- `RecurringTransactionDetector` for recurring payment detection
- Statistics and charting
