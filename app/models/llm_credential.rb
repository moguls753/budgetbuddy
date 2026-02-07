class LlmCredential < ApplicationRecord
  belongs_to :user

  encrypts :api_key

  normalizes :api_key, with: ->(v) { v.presence }

  validates :base_url, presence: true, format: { with: /\Ahttps?:\/\//i, message: "must start with http:// or https://" }
  validates :llm_model, presence: true
end
