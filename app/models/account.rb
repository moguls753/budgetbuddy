# == Schema Information
#
# Table name: accounts
#
#  id                 :integer          not null, primary key
#  currency           :string
#  iban               :string
#  name               :string
#  status             :string
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  account_id         :string
#  bank_connection_id :integer          not null
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
end
