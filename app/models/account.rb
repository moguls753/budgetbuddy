class Account < ApplicationRecord
  belongs_to :bank_connection
  has_many :transaction_records, dependent: :destroy
  has_one :user, through: :bank_connection

  validates :account_uid, presence: true
  validates :currency, presence: true

  def display_name
    name.presence || iban.presence || "Account #{id}"
  end
end
