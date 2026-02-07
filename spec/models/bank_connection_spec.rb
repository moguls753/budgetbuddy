require "rails_helper"

RSpec.describe BankConnection, type: :model do
  it "is valid with required attributes" do
    expect(build(:bank_connection)).to be_valid
  end

  it "requires institution_id" do
    expect(build(:bank_connection, institution_id: nil)).not_to be_valid
  end

  it "rejects invalid status" do
    expect { build(:bank_connection, status: "invalid") }.to raise_error(ArgumentError)
  end

  it "knows when expired" do
    expect(build(:bank_connection, status: "expired")).to be_expired
  end
end
