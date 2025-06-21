# == Schema Information
#
# Table name: accounts
#
#  id                               :integer          not null, primary key
#  account_ratelimit                :integer
#  account_ratelimit_remaining      :integer
#  account_ratelimit_reset          :integer
#  balances_ratelimit               :integer
#  balances_ratelimit_remaining     :integer
#  balances_ratelimit_reset         :integer
#  closing_booked                   :decimal(, )
#  currency                         :string
#  details_ratelimit                :integer
#  details_ratelimit_remaining      :integer
#  details_ratelimit_reset          :integer
#  iban                             :string
#  interim_available                :decimal(, )
#  interim_booked                   :decimal(, )
#  name                             :string
#  status                           :string
#  transactions_ratelimit           :integer
#  transactions_ratelimit_remaining :integer
#  transactions_ratelimit_reset     :integer
#  created_at                       :datetime         not null
#  updated_at                       :datetime         not null
#  account_id                       :string
#  bank_connection_id               :integer          not null
#
# Indexes
#
#  index_accounts_on_bank_connection_id  (bank_connection_id)
#
# Foreign Keys
#
#  bank_connection_id  (bank_connection_id => bank_connections.id)
#

class Account < ApplicationRecord
  belongs_to :bank_connection
  has_many :transaction_records

  def balances_json
    {
      iban:,
      interim_available:,
      interim_booked:,
      closing_booked:
    }
  end

  def details_json
    as_json(except: [ :created_at, :updated_at, :interim_booked, :interim_booked, :closing_booked ])
  end
end
