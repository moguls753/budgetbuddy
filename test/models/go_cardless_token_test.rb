# == Schema Information
#
# Table name: go_cardless_tokens
#
#  id              :integer          not null, primary key
#  access_expires  :integer          default(0), not null
#  access_token    :string
#  refresh_expires :integer          default(0), not null
#  refresh_token   :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

require "test_helper"

class GoCardlessTokenTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
