FactoryBot.define do
  factory :account do
    bank_connection
    account_uid { SecureRandom.uuid }
    iban { "DE89370400440532013000" }
    name { "Girokonto" }
    currency { "EUR" }
    balance_amount { 1234.56 }
    balance_type { "CLBD" }
  end
end
