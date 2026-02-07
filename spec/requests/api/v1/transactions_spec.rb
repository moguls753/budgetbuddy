require "rails_helper"

RSpec.describe "Api::V1::Transactions", type: :request do
  let(:user) { create(:user, password: "password123") }
  let(:bc) { create(:bank_connection, user: user) }
  let(:account) { create(:account, bank_connection: bc) }
  before { post session_path, params: { email_address: user.email_address, password: "password123" }, as: :json }

  it "returns paginated transactions" do
    create_list(:transaction_record, 3, account: account)
    get api_v1_transactions_path, as: :json

    body = response.parsed_body
    expect(body["transactions"].length).to eq(3)
    expect(body["meta"]["total"]).to eq(3)
  end

  it "filters by date range and account" do
    create(:transaction_record, account: account, booking_date: "2026-01-15")
    create(:transaction_record, account: account, booking_date: "2025-12-01")

    get api_v1_transactions_path, params: { from: "2026-01-01", to: "2026-01-31", account_id: account.id }, as: :json
    expect(response.parsed_body["transactions"].length).to eq(1)
  end

  it "filters uncategorized" do
    create(:transaction_record, account: account, category: create(:category, user: user))
    create(:transaction_record, account: account, category: nil)

    get api_v1_transactions_path, params: { uncategorized: "true" }, as: :json
    expect(response.parsed_body["transactions"].length).to eq(1)
  end

  it "searches by remittance text" do
    create(:transaction_record, account: account, remittance: "REWE Markt")
    create(:transaction_record, account: account, remittance: "Gehalt", creditor_name: "Arbeitgeber")

    get api_v1_transactions_path, params: { search: "REWE" }, as: :json
    expect(response.parsed_body["transactions"].length).to eq(1)
  end
end
