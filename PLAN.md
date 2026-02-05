# BudgetBuddy v2 — Rails + React (vite_rails)

## Overview

Fresh Rails 8 + React app in the `moguls753/budgetbuddy` repo. React is integrated via `vite_rails` — components live in `app/javascript/`, mounted in Rails views. One repo, one `package.json`, one dev server (`bin/dev`).

## What's Done (Phase 1)

- [x] Legacy branch created and pushed (old Vue app preserved)
- [x] Fresh Rails 8 app generated (`rails new . --database=sqlite3 --skip-test`)
- [x] RSpec set up with `factory_bot_rails` and `faker`
- [x] Authentication via `bin/rails generate authentication`
  - User model with validations (email format, uniqueness, password min 8)
  - Session model with IP + user agent tracking
  - Authentication concern with cookie-based sessions
  - Controllers adapted with `respond_to` for JSON + HTML
- [x] UsersController for signup (`POST /user`) and current user (`GET /me`)
- [x] API placeholder controllers (`Api::V1::Accounts`, `Api::V1::Transactions`)
- [x] 13 tests passing (model specs + request specs)
- [x] `vite_rails` installed with React + TypeScript
- [x] Login form component in `app/javascript/components/App.tsx`
- [x] Rails view mounts React at `root "home#index"` via `<div id="react-app">`

## Project Structure

```
budgetbuddy/
├── app/
│   ├── controllers/
│   │   ├── api/v1/              # Versioned JSON API
│   │   ├── home_controller.rb   # Root — mounts React
│   │   ├── sessions_controller.rb
│   │   ├── users_controller.rb
│   │   └── passwords_controller.rb
│   ├── javascript/              # React code (via vite_rails)
│   │   ├── entrypoints/
│   │   │   └── application.tsx  # Mounts React into #react-app
│   │   └── components/
│   │       └── App.tsx          # Root React component
│   ├── models/
│   ├── views/
│   │   ├── layouts/application.html.erb
│   │   └── home/index.html.erb  # Just <div id="react-app">
│   ├── services/                # Future: GoCardless, Gemini, etc.
│   └── jobs/                    # Future: Sync, Categorize, etc.
├── spec/
│   ├── models/user_spec.rb
│   ├── requests/
│   │   ├── sessions_spec.rb
│   │   └── users_spec.rb
│   └── factories/users.rb
├── config/
│   ├── routes.rb
│   └── vite.json
├── package.json                 # One package.json at root
├── vite.config.ts
├── Gemfile
└── Procfile.dev                 # bin/dev runs Rails + Vite
```

## What's Next

### Phase 1 remaining — React login flow
- [ ] Add error/success state to login form
- [ ] Add signup form
- [ ] Check auth on page load (`GET /me`)
- [ ] Show dashboard when logged in, login when not
- [ ] Install Tailwind CSS + DaisyUI for styling
- [ ] i18n setup (Rails locales + React translations)

### Phase 2 — Bank Integration + Dashboard (future)

Bring in from legacy branch (with fixes):

| Component | Fixes Needed |
|---|---|
| `GoCardless::Client` | Environment-based URLs, better error types |
| `GeminiCategorizer` | Replace Net::HTTP with Faraday, add timeouts |
| `Statistics` | Keep as-is |
| `SyncAccountsJob` | Fix hardcoded localhost URL, wrap in transaction |
| `Category` model | Keep as-is |
| `BankConnection` model | Rename `credentials_encrypted` -> `credentials` |
| `GoCardlessToken` model | Fix expiration to use `updated_at` |
| DB migrations | Proper indexes, decimal precision for money |

New:
- `Api::V1::AccountsController` with proper serialization + pagination
- `Api::V1::TransactionsController` with filtering + pagination
- `Api::V1::CategoriesController` for CRUD
- React dashboard with charts
- Request specs for each API endpoint

### Phase 3 — Advanced Features (future)

- `RecurringTransactionDetector` (with Faraday, proper error handling)
- `SyncBarclaysJob` (fix transaction ID generation)
- `CategorizeTransactionsJob` (replace sleep with queued rate limiting)
- Forecast dashboard in React

## What Gets Dropped From Legacy

- All Vue components (replaced by React)
- `to_frontend_json` methods on models (replaced by serializers)
- Separate frontend `package.json` / Vite proxy setup
- The broken `PasswordsController` (already rewritten)
