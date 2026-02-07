FactoryBot.define do
  factory :llm_credential do
    user
    base_url { "https://api.openai.com/v1" }
    api_key { "sk-test-#{SecureRandom.hex(16)}" }
    llm_model { "gpt-4o-mini" }
  end
end
