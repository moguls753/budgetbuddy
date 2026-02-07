# LLM Transaction Categorization — Implementation Plan

## Context

Transactions are imported from banks but categories are assigned manually. We're adding LLM-based auto-categorization: press a button, uncategorized transactions get assigned to existing categories. Privacy-first: only remittance text + creditor/debtor names are sent to the LLM — never amounts, IBANs, or account details.

Supports any OpenAI-compatible API (OpenAI, LM Studio, Ollama, Together AI, etc.) via configurable base URL + API key + model name.

---

## Phase 1: LLM Credential + Settings UI + Test Connection ✅

**Status:** Complete

### What was built
- **Migration** `create_llm_credentials` — `user_id` (unique FK), `base_url` (not null), `api_key` (nullable text), `llm_model` (not null, renamed from `model_name` which is reserved by ActiveRecord)
- **Model** `app/models/llm_credential.rb` — `belongs_to :user`, `encrypts :api_key`, `normalizes :api_key` (blank → nil), validates base_url format + presence
- **User** — `has_one :llm_credential, dependent: :destroy`
- **Credentials controller** — `llm` case in show/create/update + `test` action (`POST /api/v1/credentials/test`) that sends "Say hello in one word" to the endpoint
- **Route** — `post :test, on: :collection` under credentials
- **Types** — `CredentialsStatus.llm: { configured, base_url?, llm_model? }`
- **SettingsPage** — "AI Categorization" section with label-outside-card pattern, status dot, configure/update button, shows base_url + model when configured
- **CredentialForm** — `llm` provider with Endpoint URL, API Key (optional), Model fields + "Test Connection" button with success/error message
- **i18n** — en.ts + de.ts with all llm_* keys
- **Factory + 7 model specs** — all passing, 94/94 suite green

### Key decisions
- Column named `llm_model` not `model_name` (ActiveRecord reserves `model_name`)
- `api_key` always sent from frontend (empty string if cleared), normalized to `nil` via `normalizes :api_key, with: ->(v) { v.presence }` so users can clear a previously set key
- Test connection button only shown when credentials are already saved (not on first configure)

---

## Phase 2: Categorization Service

**Goal:** Build the service that talks to the LLM and assigns categories.

### Create
- **Service** `app/services/llm_categorizer.rb`:
  - Takes a user, fetches uncategorized transactions (up to 500)
  - Batches them (~30 per LLM call)
  - Builds prompt: system message + user's category names + transaction list (id, remittance, creditor_name, debtor_name only)
  - Calls OpenAI-compatible `/chat/completions` via `Net::HTTP`
  - Parses JSON response mapping transaction IDs to category names
  - Matches names to existing category IDs, updates records
  - Skips unknown category names (doesn't create new categories)
- **Spec** `spec/services/llm_categorizer_spec.rb` — mock HTTP, test prompt privacy, test assignment, test error handling

### Prompt design
- System: "You categorize bank transactions. Given categories and transactions, return JSON mapping each transaction ID to the best category name. Only use names from the list. Use null if unsure."
- User: `Categories: [...]\n\nTransactions:\n- id:1 | REWE MARKT | creditor: REWE\n...`
- Response: `{"1": "Groceries & Drinks", "2": "Entertainment", "3": null}`

---

## Phase 3: API Endpoint + Background Job

**Goal:** Expose a trigger endpoint and run categorization async.

### Create
- **Job** `app/jobs/categorize_transactions_job.rb` — calls `LlmCategorizer.new(user).categorize_uncategorized`
- **Spec** `spec/requests/api/v1/transactions/categorize_spec.rb`

### Modify
- `config/routes.rb` — add `post :categorize` to transactions collection
- `app/controllers/api/v1/transactions_controller.rb` — add `categorize` action (checks LLM configured, enqueues job, returns 202)

---

## Phase 4: Categorize Button (Frontend)

**Goal:** Add a "Categorize" button to the Transactions page.

### Modify
- `app/javascript/pages/TransactionsPage.tsx`:
  - Fetch LLM credential status on mount (from `/api/v1/credentials`)
  - Add "Categorize" button in the filter bar (next to "Uncategorized only")
  - Show only when LLM is configured
  - On click: POST, show loading state, refetch transactions on success
- `app/javascript/locales/en.ts` — add transactions.categorize_* keys
- `app/javascript/locales/de.ts` — German equivalents

---

## Verification (after all phases)
1. `bundle exec rspec` — all tests pass
2. Configure LLM in Settings → verify save/update
3. Click "Categorize" on Transactions page with uncategorized transactions
4. Check Rails logs → only remittance/creditor/debtor in LLM request (no amounts/IBANs)
5. Verify categories assigned, page refreshes
6. Test error cases: invalid API key, unreachable endpoint, no uncategorized transactions
7. Test with local LM Studio (no API key)
