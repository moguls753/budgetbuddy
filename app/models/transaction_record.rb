class TransactionRecord < ApplicationRecord
  belongs_to :account
  belongs_to :category, optional: true
  has_one :bank_connection, through: :account
  has_one :user, through: :bank_connection

  validates :transaction_id, presence: true, uniqueness: { scope: :account_id }
  validates :amount, presence: true
  validates :currency, presence: true
  validates :booking_date, presence: true

  scope :debits, -> { where("amount < 0") }
  scope :credits, -> { where("amount > 0") }
  scope :booked, -> { where(status: "booked") }
  scope :in_period, ->(from, to) { where(booking_date: from..to) }
  scope :uncategorized, -> { where(category_id: nil) }
end
