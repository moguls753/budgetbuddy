class Category < ApplicationRecord
  belongs_to :user
  has_many :transaction_records, dependent: :nullify

  validates :name, presence: true, uniqueness: { scope: :user_id }

  normalizes :name, with: ->(n) { n.strip }
end
