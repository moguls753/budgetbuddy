# BudgetBuddy

Open-source, self-hostable personal finance manager. Import bank transactions automatically, categorize them with LLM assistance (privacy-first: only remittance text is sent, never amounts or account details), and visualize spending patterns.

Think Firefly III or Finanzguru, but free and with smart AI categorization.

## Legacy Code

The old Vue 3 + Rails app lives on the `legacy` branch. Services like `GoCardless::Client`, `GeminiCategorizer`, `RecurringTransactionDetector`, and `Statistics` will be brought into the new app in later phases with fixes applied.

## Tech Stack

- **Backend:** Rails 8 API-only (Ruby 3.3+)
- **Frontend:** React (TypeScript) with Vite, Tailwind CSS, DaisyUI
- **Database:** SQLite3
- **Auth:** Rails 8 session-based authentication (cookie-based, httponly)
- **Background Jobs:** Solid Queue
- **Monorepo:** Rails at root, React in `frontend/`

## Architecture

- Rails serves JSON API endpoints under `/api/v1/`
- Auth endpoints at root: `/session`, `/user`, `/me`
- React SPA handles all UI, routing, and state
- Vite dev server proxies API requests to Rails in development

## Testing

Tests are written with **RSpec**, using `factory_bot_rails` and `faker`.

**Philosophy:**
- Small, simple, readable tests
- Test the contract, not the implementation
- Request specs over controller specs (test real HTTP)
- Model specs for validations and core business logic
- No obsessive edge-case coverage — test the reasonable paths
- No mocking unless hitting external APIs (Gemini, GoCardless)
- A passing `bundle exec rspec` means the app works

**Run tests:** `bundle exec rspec`

## i18n

- English is the default locale
- German (`de`) as second locale
- Rails: `config/locales/{en,de}.yml`
- React: `frontend/src/locales/{en,de}.json`

## Code Style

- Follow Rails conventions (REST, fat models thin controllers — but not too fat)
- Use service objects for business logic involving external APIs
- Serialize API responses with explicit JSON structures, not `to_json` on models
- Prefer symbol syntax for ActiveRecord: `.order(booking_date: :desc)` not `.order("booking_date DESC")`
- Validate models properly (presence, format, uniqueness where needed)
- Use environment variables / Rails credentials for secrets, never hardcode URLs or API keys

## Key Commands

```
bin/rails server                  # Rails API on :3000
cd frontend && npm run dev        # React dev server on :5173
bundle exec rspec                 # Run tests
bin/dev                           # Runs both via Procfile.dev
```
