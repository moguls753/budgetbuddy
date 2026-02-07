require "rails_helper"

RSpec.describe "Api::V1::Dashboard", type: :request do
  let(:user) { create(:user, password: "password123") }
  before { post session_path, params: { email_address: user.email_address, password: "password123" }, as: :json }

  it "returns aggregated data" do
    bc = create(:bank_connection, user: user)
    account = create(:account, bank_connection: bc, balance_amount: 1000)
    create(:transaction_record, account: account, amount: -50, booking_date: Date.current)
    create(:transaction_record, :credit, account: account, booking_date: Date.current)

    get api_v1_dashboard_path, as: :json
    body = response.parsed_body
    expect(body["total_balance"]).to eq("1000.0")
    expect(body["transaction_count"]).to eq(2)
    expect(body["recent_transactions"].length).to eq(2)
  end

  it "returns zeros when empty" do
    get api_v1_dashboard_path, as: :json
    body = response.parsed_body
    expect(body["total_balance"]).to eq("0.0")
    expect(body["transaction_count"]).to eq(0)
  end
end
