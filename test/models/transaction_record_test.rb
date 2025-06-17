# == Schema Information
#
# Table name: transaction_records
#
#  id                    :integer          not null, primary key
#  amount                :decimal(, )
#  bank_transaction_code :string
#  booking_date          :date
#  category              :string
#  creditor_iban         :string
#  creditor_name         :string
#  currency              :string
#  debtor_iban           :string
#  debtor_name           :string
#  remittance            :text
#  value_date            :date
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  account_id            :integer          not null
#  creditor_id           :string
#  mandate_id            :string
#  transaction_id        :string
#
# Indexes
#
#  index_transaction_records_on_account_id  (account_id)
#
# Foreign Keys
#
#  account_id  (account_id => accounts.id)
#

require "test_helper"

class TransactionRecordTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
