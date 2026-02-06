class BankConnection < ApplicationRecord
  belongs_to :user
  has_many :accounts, dependent: :destroy

  enum :provider, { enable_banking: "enable_banking", gocardless: "gocardless" }

  validates :institution_id, presence: true
  validates :provider, presence: true
  validates :status, presence: true, inclusion: { in: %w[pending authorized expired error] }

  scope :authorized, -> { where(status: "authorized") }
  scope :active, -> { authorized.where("valid_until > ?", Time.current) }

  def active?
    status == "authorized" && valid_until&.future?
  end

  def expired?
    valid_until&.past? || status == "expired"
  end
end
