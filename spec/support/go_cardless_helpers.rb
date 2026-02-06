module GoCardlessHelpers
  def gc_token_response
    {
      access: "gc-access-token-abc",
      refresh: "gc-refresh-token-xyz",
      access_expires: 86400,
      refresh_expires: 2592000
    }
  end

  def gc_refresh_response
    {
      access: "gc-access-token-refreshed",
      access_expires: 86400
    }
  end

  def gc_institutions_response
    [
      { id: "TOMORROW_SOLDE1S", name: "Tomorrow", logo: "https://example.com/tomorrow.png", countries: [ "DE" ] },
      { id: "SPARKASSE_FREIBURG", name: "Sparkasse Freiburg", logo: "https://example.com/spk.png", countries: [ "DE" ] }
    ]
  end

  def gc_requisition_response
    {
      id: "req-uuid-1234",
      status: "LN",
      link: "https://ob.gocardless.com/psd2/start/req-uuid-1234",
      accounts: [ "gc-account-id-1", "gc-account-id-2" ]
    }
  end

  def gc_balances_response
    {
      balances: [
        { balanceAmount: { amount: "1234.56", currency: "EUR" }, balanceType: "closingBooked" }
      ]
    }
  end

  def gc_transactions_response
    {
      transactions: {
        booked: [
          {
            internalTransactionId: "gc-tx-001",
            transactionAmount: { amount: "-42.50", currency: "EUR" },
            bookingDate: "2026-01-15",
            valueDate: "2026-01-15",
            remittanceInformationUnstructured: "REWE Markt Freiburg",
            creditorName: "REWE Markt GmbH",
            creditorAccount: { iban: "DE123456789" },
            debtorName: nil,
            debtorAccount: nil,
            proprietaryBankTransactionCode: "PMNT"
          },
          {
            internalTransactionId: "gc-tx-002",
            transactionAmount: { amount: "2500.00", currency: "EUR" },
            bookingDate: "2026-01-14",
            valueDate: "2026-01-14",
            remittanceInformationUnstructured: "Gehalt Januar",
            creditorName: nil,
            creditorAccount: nil,
            debtorName: "Arbeitgeber GmbH",
            debtorAccount: { iban: "DE987654321" },
            proprietaryBankTransactionCode: "PMNT"
          }
        ],
        pending: []
      }
    }
  end

  def gc_account_details_response
    {
      account: {
        iban: "DE89370400440532013000",
        currency: "EUR",
        ownerName: "Max Mustermann",
        status: "READY"
      }
    }
  end
end

RSpec.configure do |config|
  config.include GoCardlessHelpers
end
