require "rails_helper"

RSpec.describe Category, type: :model do
  it "is valid with a user and name" do
    expect(build(:category)).to be_valid
  end

  it "requires a name" do
    expect(build(:category, name: nil)).not_to be_valid
  end

  it "requires unique name per user" do
    user = create(:user)
    create(:category, user: user, name: "Groceries")
    expect(build(:category, user: user, name: "Groceries")).not_to be_valid
  end

  it "allows same name for different users" do
    create(:category, name: "Groceries")
    expect(build(:category, name: "Groceries")).to be_valid
  end

  it "strips whitespace from name" do
    category = create(:category, name: "  Groceries  ")
    expect(category.name).to eq("Groceries")
  end

  it "nullifies transaction_records on destroy" do
    category = create(:category)
    transaction = create(:transaction_record, category: category)
    category.destroy!
    expect(transaction.reload.category_id).to be_nil
  end
end
