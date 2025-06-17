# == Schema Information
#
# Table name: accounts
#
#  id                 :integer          not null, primary key
#  closing_booked     :decimal(, )
#  currency           :string
#  iban               :string
#  interim_available  :decimal(, )
#  interim_booked     :decimal(, )
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

require "test_helper"

class AccountTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
