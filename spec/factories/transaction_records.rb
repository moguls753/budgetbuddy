FactoryBot.define do
  factory :transaction_record do
    account
    transaction_id { SecureRandom.uuid }
    amount { -42.50 }
    currency { "EUR" }
    booking_date { Date.current }
    value_date { Date.current }
    status { "booked" }
    remittance { "REWE Markt Freiburg" }
    creditor_name { "REWE Markt GmbH" }

    trait :credit do
      amount { 2500.00 }
      remittance { "Gehalt Januar" }
      creditor_name { nil }
      debtor_name { "Arbeitgeber GmbH" }
    end

    trait :pending do
      status { "pending" }
    end
  end
end
