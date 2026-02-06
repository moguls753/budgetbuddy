# Kontor

Open-source, self-hostable personal finance manager. Import bank transactions automatically, categorize them with LLM assistance, and visualize your spending patterns.

Privacy-first: when using AI categorization, only the remittance text is sent to the LLM — never amounts, balances, or account details.

Think Firefly III or Finanzguru, but free and with smart AI categorization.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Ruby on Rails 8, Ruby 3.4 |
| Frontend | React 19 (TypeScript) via `vite_rails` |
| Styling | Tailwind CSS v4 |
| Database | SQLite3 |
| Auth | Session-based (Rails 8 `has_secure_password` + bcrypt) |
| Background Jobs | Solid Queue |
| i18n | English + German (react-i18next) |
| Testing | RSpec, factory_bot, faker |
| Deployment | Kamal (Docker) |

## Self-Hosting

### Requirements

- Ruby 3.4+
- Node.js 20+
- SQLite3

### Setup

```bash
git clone https://github.com/moguls753/kontor.git
cd kontor
bundle install
npm install
bin/rails db:setup
```

Set your Rails master key (needed to decrypt credentials):

```bash
# Either as an environment variable:
export RAILS_MASTER_KEY="your-key-here"

# Or as a file:
echo "your-key-here" > config/master.key
```

### Running

```bash
bin/dev  # Starts Rails + Vite together
```

The app will be available at `http://localhost:3000`.

### Running Tests

```bash
bundle exec rspec
```

## Roadmap

- [x] Authentication (signup, login, sessions)
- [x] Design system (Soft Brutalist + Warm Tones + Teal Accent)
- [x] i18n (English + German)
- [ ] Bank account integration via GoCardless
- [ ] Transaction import and management
- [ ] AI-powered categorization (Gemini)
- [ ] Recurring transaction detection
- [ ] Spending statistics and charts
- [ ] Forecast dashboard

## License

This project is open source. Contributions welcome.
