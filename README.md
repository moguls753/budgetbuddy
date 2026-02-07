# Kontor

Open-source, self-hostable personal finance manager. Import bank transactions automatically via Open Banking, categorize them with AI assistance, and track your spending — all on your own server.

**Privacy-first**: when using AI categorization, only the remittance text is sent to the LLM — never amounts, balances, or account details.

## Why Kontor?

Most personal finance tools are either closed-source SaaS (your data on someone else's server) or open-source but manual (CSV imports, no bank sync). Kontor gives you both: automatic bank sync via Open Banking APIs and full ownership of your data.

- Connect 2,500+ European banks via Enable Banking or GoCardless
- AI-powered transaction categorization (cloud or local LLMs)
- Self-host on anything that runs Docker — a VPS, a NAS, a Raspberry Pi
- No tracking, no ads, no data sharing

## Features

- **Bank sync** — Connect bank accounts via Enable Banking or GoCardless Open Banking APIs. OAuth flow, automatic transaction import, balance tracking.
- **Transaction management** — Search, filter by account/category/date, pagination. Debounced search, responsive design.
- **AI categorization** — Categorize transactions using LLMs. Works with cloud providers (Google Gemini) or local models via any OpenAI-compatible API (LM Studio, Ollama, llama.cpp, etc.).
- **Categories** — Full CRUD. Inline editing with keyboard shortcuts.
- **Dashboard** — Total balance, monthly income/expenses, recent transactions at a glance.
- **Multi-language** — English and German. Locale-aware number and date formatting.
- **Dark mode** — System-aware with manual toggle.
- **Deployment** — Kamal-ready with Docker. SQLite means zero database infrastructure.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Ruby on Rails 8, Ruby 3.4 |
| Frontend | React 19 (TypeScript) via `vite_rails` |
| Styling | Tailwind CSS v4 |
| Database | SQLite3 |
| Auth | Session-based (`has_secure_password` + bcrypt) |
| Background Jobs | Solid Queue |
| i18n | English + German (`react-i18next`) |
| Testing | RSpec, factory_bot, faker |
| Deployment | Kamal (Docker) |

## Self-Hosting

### Docker (recommended)

The easiest way to run Kontor. No Ruby, Node, or build tools needed — everything is inside the image.

```yaml
# docker-compose.yml
services:
  kontor:
    image: ghcr.io/moguls753/kontor:latest
    ports:
      - "3000:3000"
    volumes:
      - kontor_data:/rails/storage
    environment:
      - SECRET_KEY_BASE=generate-a-64-char-hex-string

volumes:
  kontor_data:
```

```bash
# Generate a secret key
openssl rand -hex 64

# Start Kontor
docker compose up -d
```

The app will be available at `http://localhost:3000`. The volume persists your SQLite database and uploaded files across restarts.

### From source (development)

If you want to contribute or run from source:

**Requirements:** Ruby 3.4+, Node.js 20+, SQLite3

```bash
git clone https://github.com/moguls753/kontor.git
cd kontor
bundle install
npm install
bin/rails db:setup
bin/dev  # Starts Rails + Vite together
```

The app will be available at `http://localhost:3000`.

### Production with Kamal

Kontor includes a `config/deploy.yml` for [Kamal](https://kamal-deploy.org/) deployments. Set `RAILS_MASTER_KEY` in `.kamal/secrets` and update the server IP in `deploy.yml`.

### Running Tests

```bash
bundle exec rspec
```

## Banking Providers

Kontor supports two Open Banking providers. You only need one.

| Provider | Coverage | Setup |
|---|---|---|
| [Enable Banking](https://enablebanking.com) | 2,500+ European banks | App ID + RSA private key |
| [GoCardless](https://gocardless.com/bank-account-data/) | 2,400+ European banks | Secret ID + Secret key |

Configure credentials in Settings, then connect your bank through the in-app flow. The OAuth redirect handles the rest.

## AI Categorization

Transaction categorization works with any LLM provider:

- **Cloud**: Google Gemini (default), or any OpenAI-compatible API
- **Local**: LM Studio, Ollama, llama.cpp server, or any tool that exposes an OpenAI-compatible endpoint

Only the remittance text (e.g., "REWE MARKT BERLIN") is sent to the model. Amounts, IBANs, balances, and account details never leave your server.

## Roadmap

- [x] Authentication (signup, login, sessions)
- [x] Design system (Soft Brutalist + Warm Tones + Teal Accent)
- [x] i18n (English + German)
- [x] Bank account integration (Enable Banking + GoCardless)
- [x] Transaction import, filtering, and pagination
- [x] Account management with sync and status tracking
- [x] Category management (CRUD)
- [x] Credential management and bank connection OAuth flow
- [x] Dashboard with live balances and recent transactions
- [ ] AI-powered categorization (Gemini + local LLM support)
- [ ] Recurring transaction detection
- [ ] Spending statistics and charts
- [ ] CSV/MT940 import
- [ ] Multi-currency support
- [ ] Mobile app (or PWA)

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE)
