class EnableBankingCredential < ApplicationRecord
  belongs_to :user

  encrypts :private_key_pem

  validates :app_id, presence: true
  validates :private_key_pem, presence: true
end
