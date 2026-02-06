FactoryBot.define do
  factory :enable_banking_credential do
    user
    app_id { SecureRandom.uuid }
    private_key_pem { OpenSSL::PKey::RSA.generate(2048).to_pem }
  end
end
