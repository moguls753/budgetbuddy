require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with email and password" do
    expect(build(:user)).to be_valid
  end

  it "requires email" do
    expect(build(:user, email_address: nil)).not_to be_valid
  end

  it "requires unique email" do
    create(:user, email_address: "test@example.com")
    expect(build(:user, email_address: "test@example.com")).not_to be_valid
  end

  it "requires password minimum 8 characters" do
    expect(build(:user, password: "short")).not_to be_valid
  end

  it "normalizes email to lowercase" do
    user = create(:user, email_address: "FOO@BAR.COM")
    expect(user.email_address).to eq("foo@bar.com")
  end

  it "validates email format" do
    expect(build(:user, email_address: "not-an-email")).not_to be_valid
  end

  it "creates default categories" do
    user = create(:user)
    user.create_default_categories!(locale: :de)
    expect(user.categories.count).to eq(17)
    expect(user.categories.pluck(:name)).to include("Lebensmittel & Getränke")
  end
end
