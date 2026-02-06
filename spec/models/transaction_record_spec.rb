require "rails_helper"

RSpec.describe TransactionRecord, type: :model do
  it "is valid with required attributes" do
    expect(build(:transaction_record)).to be_valid
  end

  it "requires transaction_id, amount, currency, booking_date" do
    %i[transaction_id amount currency booking_date].each do |attr|
      expect(build(:transaction_record, attr => nil)).not_to be_valid
    end
  end

  it "requires unique transaction_id per account" do
    account = create(:account)
    create(:transaction_record, account: account, transaction_id: "TX123")
    expect(build(:transaction_record, account: account, transaction_id: "TX123")).not_to be_valid
  end
end
