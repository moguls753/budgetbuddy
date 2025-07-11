# == Schema Information
#
# Table name: bank_connections
#
#  id             :integer          not null, primary key
#  link           :string
#  status         :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  institution_id :string
#  requisition_id :string
#  user_id        :integer          not null
#
# Indexes
#
#  index_bank_connections_on_user_id  (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#

class BankConnection < ApplicationRecord
  belongs_to :user
  has_one :agreement
  has_many :accounts

  encrypts :credentials_encrypted
  serialize :scraper_config, coder: JSON

  enum :provider, {
    gocardless: "gocardless",
    barclays_scraper: "barclays_scraper",
    scalable_capital_scraper: "scalable_capital_scraper",
    trade_republic_scraper: "trade_republic_scraper"
  }

  validates :requisition_id, :institution_id, presence: true, if: :gocardless?
  validates :provider, presence: true
  validates :credentials_encrypted, presence: true, if: :scraper?

  scope :scrapers, -> { where.not(provider: "gocardless") }
  scope :api_connections, -> { where(provider: "gocardless") }

  def scraper?
    !gocardless?
  end

  def api_connection?
    gocardless?
  end

  def set_credentials(username:, password:, **additional_fields)
    credentials = { username: username, password: password }.merge(additional_fields)
    self.credentials_encrypted = credentials.to_json
  end

  def get_credentials
    return {} unless credentials_encrypted.present?
    JSON.parse(credentials_encrypted).with_indifferent_access
  rescue JSON::ParserError
    {}
  end

  def self.create_scraper_connection!(provider:, user:, username:, password:, **additional_fields)
    connection = new(provider: provider, user: user, status: "pending")
    connection.set_credentials(username: username, password: password, **additional_fields)
    connection.save!
    connection
  end
end
