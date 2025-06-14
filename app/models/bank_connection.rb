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
end
