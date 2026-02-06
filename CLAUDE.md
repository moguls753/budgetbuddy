# Kontor

Open-source, self-hostable personal finance manager. Import bank transactions automatically, categorize them with LLM assistance (privacy-first: only remittance text is sent, never amounts or account details), and visualize spending patterns.

Think Firefly III or Finanzguru, but free and with smart AI categorization.

## Legacy Code

The old Vue 3 + Rails app lives on the `legacy` branch. Services like `GoCardless::Client`, `GeminiCategorizer`, `RecurringTransactionDetector`, and `Statistics` will be brought into the new app in later phases with fixes applied.

## Tech Stack

- **Backend:** Rails 8 (Ruby 3.3+)
- **Frontend:** React (TypeScript) via `vite_rails`, Tailwind CSS v4
- **Database:** SQLite3
- **Auth:** Rails 8 session-based authentication (`bin/rails generate authentication`)
- **Background Jobs:** Solid Queue
- **Build:** Vite integrated via `vite_rails` gem — one `package.json` at root

## Architecture

- Rails full app with React components mounted in views via `vite_rails`
- React code lives in `app/javascript/` (Rails convention)
- Controllers use `respond_to` for both JSON (React) and HTML formats
- Auth endpoints: `/session`, `/user`, `/me`
- API endpoints under `/api/v1/`
- One server in development: `bin/dev` runs Rails + Vite together

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
- React: translation files in `app/javascript/locales/`

## Design System

**Direction:** Soft Brutalist + Warm Tones + Teal Accent

**Principles:**
- Clean, honest UI — no fake depth or unnecessary decoration
- 2px borders, sharp corners, no shadows
- Visible structure over hidden magic
- Numbers displayed with confidence (monospace, large)
- UX first — functional before pretty

**Colors** (CSS variables in `app/javascript/styles/application.css`):
- Surface: warm off-white (`#faf9f7`) / warm dark (`#1c1c1c`)
- Accent: teal (`#0d9488` light / `#2dd4bf` dark)
- Text: near-black / near-white with muted variants
- Error: red with subtle backgrounds

**Typography:**
- Display: DM Sans (geometric, warm)
- Mono: JetBrains Mono (for money/numbers)

**Components:**
- `.card` / `.card-hero` / `.card-interactive` — bordered containers
- `.btn` / `.btn-primary` / `.btn-ghost` / `.btn-icon` — button variants
- `.input` — form inputs with 2px borders
- `.nav-item` / `.nav-item-active` — sidebar navigation
- `.label` — small uppercase labels
- `.text-default` / `.text-muted` / `.text-accent` — text colors
- `.animate-in` / `.delay-1..4` — entrance animations

**Dark mode:** Toggle via `.dark` class on `<html>`, persisted to localStorage.

## Code Style

- Follow Rails conventions (REST, fat models thin controllers — but not too fat)
- Use service objects for business logic involving external APIs
- Serialize API responses with explicit JSON structures, not `to_json` on models
- Prefer symbol syntax for ActiveRecord: `.order(booking_date: :desc)` not `.order("booking_date DESC")`
- Validate models properly (presence, format, uniqueness where needed)
- Use environment variables / Rails credentials for secrets, never hardcode URLs or API keys

## Key Commands

```
bin/dev                           # Runs Rails + Vite via Procfile.dev
bin/rails server                  # Rails only on :3000
bundle exec rspec                 # Run tests
```
