# == Schema Information
#
# Table name: transaction_records
#
#  id             :integer          not null, primary key
#  amount         :decimal(, )
#  booking_date   :date
#  category       :string
#  currency       :string
#  remittance     :text
#  value_date     :date
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  account_id     :integer          not null
#  transaction_id :string
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
