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

  def to_frontend_json
    {
      id:,
      account_ratelimit:,
      account_ratelimit_remaining:,
      account_ratelimit_reset:,
      balances_ratelimit:,
      balances_ratelimit_remaining:,
      balances_ratelimit_reset:,
      closing_booked: closing_booked.to_f,
      currency:,
      details_ratelimit:,
      details_ratelimit_remaining:,
      details_ratelimit_reset:,
      iban:,
      interim_available: interim_available.to_f,
      interim_booked: interim_booked.to_f,
      name:,
      status:,
      transactions_ratelimit:,
      transactions_ratelimit_remaining:,
      transactions_ratelimit_reset:,
      account_id:,
      bank_connection_id:
    }
  end
end
