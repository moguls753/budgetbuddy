require "rails_helper"

RSpec.describe Account, type: :model do
  it "is valid with required attributes" do
    expect(build(:account)).to be_valid
  end

  it "requires account_uid" do
    expect(build(:account, account_uid: nil)).not_to be_valid
  end

  it "falls back display_name to iban then id" do
    expect(build(:account, name: "Giro").display_name).to eq("Giro")
    expect(build(:account, name: nil, iban: "DE89").display_name).to eq("DE89")
    account = create(:account, name: nil, iban: nil)
    expect(account.display_name).to eq("Account #{account.id}")
  end
end
