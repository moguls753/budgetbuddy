# == Schema Information
#
# Table name: agreements
#
#  id                    :integer          not null, primary key
#  access_scope          :text
#  access_valid_for_days :integer
#  max_historical_days   :integer
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  agreement_id          :string
#  bank_connection_id    :integer          not null
#
# Indexes
#
#  index_agreements_on_bank_connection_id  (bank_connection_id)
#
# Foreign Keys
#
#  bank_connection_id  (bank_connection_id => bank_connections.id)
#

require "test_helper"

class AgreementTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
