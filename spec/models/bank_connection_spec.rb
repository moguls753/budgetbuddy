require "rails_helper"

RSpec.describe BankConnection, type: :model do
  it "is valid with required attributes" do
    expect(build(:bank_connection)).to be_valid
  end

  it "requires institution_id" do
    expect(build(:bank_connection, institution_id: nil)).not_to be_valid
  end

  it "validates status inclusion" do
    expect(build(:bank_connection, status: "invalid")).not_to be_valid
  end

  it "knows when active" do
    expect(build(:bank_connection, status: "authorized", valid_until: 1.day.from_now)).to be_active
    expect(build(:bank_connection, status: "authorized", valid_until: 1.day.ago)).not_to be_active
  end

  it "knows when expired" do
    expect(build(:bank_connection, valid_until: 1.day.ago)).to be_expired
    expect(build(:bank_connection, status: "expired")).to be_expired
  end
end
