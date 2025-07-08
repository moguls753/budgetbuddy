# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  email_address   :string           not null
#  first_name      :string
#  last_name       :string
#  password_digest :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_users_on_email_address  (email_address) UNIQUE
#

class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :bank_connections
  has_many :accounts, through: :bank_connections
  has_many :categories, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  def create_default_categories!
    default_categories = [
      "Lebensmittel & Getränke",
      "Restaurants & Cafés",
      "Transport & Verkehr",
      "Shopping & Kleidung",
      "Unterhaltung",
      "Wohnen & Miete",
      "Strom & Energie",
      "Internet",
      "Telefon",
      "Gesundheit & Apotheke",
      "Bildung",
      "Reisen",
      "Einkommen & Gehalt",
      "Überweisungen",
      "Sparen",
      "Bargeld & ATM",
      "Sonstiges"
    ]

    default_categories.each do |category_name|
      categories.find_or_create_by(name: category_name)
    end
  end
end
