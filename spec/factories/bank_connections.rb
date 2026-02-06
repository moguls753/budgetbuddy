FactoryBot.define do
  factory :bank_connection do
    user
    institution_id { "SPARKASSE_FREIBURG_DE" }
    institution_name { "Sparkasse Freiburg" }
    country_code { "DE" }
    status { "authorized" }
    provider { "enable_banking" }
    session_id { SecureRandom.uuid }
    valid_until { 180.days.from_now }

    trait :pending do
      status { "pending" }
      session_id { nil }
      valid_until { nil }
    end

    trait :expired do
      status { "expired" }
      valid_until { 1.day.ago }
    end

    trait :error do
      status { "error" }
      error_message { "Bank connection failed" }
    end

    trait :gocardless do
      provider { "gocardless" }
      session_id { nil }
      requisition_id { SecureRandom.uuid }
      institution_id { "TOMORROW_SOLDE1S" }
      institution_name { "Tomorrow" }
    end
  end
end
