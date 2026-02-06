FactoryBot.define do
  factory :go_cardless_credential do
    user
    secret_id { SecureRandom.uuid }
    secret_key { SecureRandom.hex(32) }

    trait :with_token do
      access_token { SecureRandom.hex(32) }
      refresh_token { SecureRandom.hex(32) }
      access_expires_at { 1.day.from_now }
      refresh_expires_at { 30.days.from_now }
    end

    trait :expired_access do
      access_token { SecureRandom.hex(32) }
      refresh_token { SecureRandom.hex(32) }
      access_expires_at { 1.hour.ago }
      refresh_expires_at { 30.days.from_now }
    end

    trait :fully_expired do
      access_token { SecureRandom.hex(32) }
      refresh_token { SecureRandom.hex(32) }
      access_expires_at { 1.hour.ago }
      refresh_expires_at { 1.hour.ago }
    end
  end
end
