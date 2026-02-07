class BankConnection < ApplicationRecord
  belongs_to :user
  has_many :accounts, dependent: :destroy

  enum :provider, { enable_banking: "enable_banking", gocardless: "gocardless" }
  enum :status, { pending: "pending", authorized: "authorized", expired: "expired", error: "error" }

  validates :institution_id, presence: true

  scope :active, -> { authorized.where("valid_until IS NULL OR valid_until > ?", Time.current) }
end
