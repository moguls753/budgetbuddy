module EnableBankingHelpers
  def eb_aspsps_response
    {
      aspsps: [
        { name: "Sparkasse Berlin", country: "DE", logo: "https://example.com/logo.png" },
        { name: "Deutsche Bank", country: "DE", logo: "https://example.com/db.png" }
      ]
    }
  end

  def eb_auth_response
    {
      url: "https://bank.example.com/authorize?state=abc123",
      authorization_id: "auth-uuid-1234"
    }
  end

  def eb_session_response
    {
      session_id: "session-uuid-5678",
      accounts: [
        { uid: "account-uid-1", identification_hash: "hash1", iban: "DE89370400440532013000" },
        { uid: "account-uid-2", identification_hash: "hash2", iban: "DE27100777770209299700" }
      ],
      access: { valid_until: "2026-08-01T00:00:00Z" }
    }
  end

  def eb_balances_response
    {
      balances: [
        { balance_amount: { amount: "1234.56", currency: "EUR" }, balance_type: "closingBooked" }
      ]
    }
  end

  def eb_transactions_response(continuation_key: nil)
    {
      transactions: [
        {
          transaction_id: "tx-001",
          transaction_amount: { amount: "42.50", currency: "EUR" },
          credit_debit_indicator: "DBIT",
          booking_date: "2026-01-15",
          value_date: "2026-01-15",
          status: "booked",
          remittance_information: [ "REWE Markt", "Freiburg" ],
          creditor: { name: "REWE Markt GmbH" },
          creditor_account: { iban: "DE123456789" },
          debtor: nil,
          debtor_account: nil,
          entry_reference: "ref-001"
        },
        {
          transaction_id: "tx-002",
          transaction_amount: { amount: "2500.00", currency: "EUR" },
          credit_debit_indicator: "CRDT",
          booking_date: "2026-01-14",
          value_date: "2026-01-14",
          status: "booked",
          remittance_information: [ "Gehalt Januar" ],
          creditor: nil,
          creditor_account: nil,
          debtor: { name: "Arbeitgeber GmbH" },
          debtor_account: { iban: "DE987654321" },
          entry_reference: "ref-002"
        }
      ],
      continuation_key: continuation_key
    }
  end
end

RSpec.configure do |config|
  config.include EnableBankingHelpers
end
