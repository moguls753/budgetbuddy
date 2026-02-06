require "rails_helper"
require "webmock/rspec"

RSpec.describe EnableBanking::Client do
  let(:key) { OpenSSL::PKey::RSA.generate(2048) }
  let(:client) { described_class.new(app_id: "test-app-id", private_key_pem: key.to_pem) }
  let(:base) { "https://api.enablebanking.com" }

  it "GETs with Bearer JWT and parses JSON" do
    stub = stub_request(:get, "#{base}/aspsps?country=DE")
      .with { |req| req.headers["Authorization"]&.match?(/^Bearer .+/) }
      .to_return(status: 200, body: eb_aspsps_response.to_json)

    result = client.list_aspsps(country: "DE")
    expect(stub).to have_been_requested
    expect(result[:aspsps].first[:name]).to eq("Sparkasse Berlin")
  end

  it "POSTs JSON body" do
    stub_request(:post, "#{base}/sessions")
      .to_return(status: 200, body: eb_session_response.to_json)

    result = client.create_session(code: "auth-code-xyz")
    expect(result[:session_id]).to eq("session-uuid-5678")
  end

  it "DELETEs and returns nil" do
    stub_request(:delete, "#{base}/sessions/session-uuid-5678")
      .to_return(status: 204, body: nil)

    expect(client.delete_session(session_id: "session-uuid-5678")).to be_nil
  end

  it "fetches transactions with continuation_key pagination" do
    stub_request(:get, "#{base}/accounts/uid-1/transactions")
      .with(query: { date_from: "2026-01-01", date_to: "2026-01-31", continuation_key: "page2" })
      .to_return(status: 200, body: eb_transactions_response.to_json)

    result = client.account_transactions(
      account_uid: "uid-1", date_from: "2026-01-01", date_to: "2026-01-31", continuation_key: "page2"
    )
    expect(result[:transactions].length).to eq(2)
  end

  it "raises RateLimitError on 429" do
    stub_request(:get, "#{base}/aspsps?country=DE")
      .to_return(status: 429, body: '{"error":"ASPSP_RATE_LIMIT_EXCEEDED"}')

    expect { client.list_aspsps(country: "DE") }.to raise_error(EnableBanking::RateLimitError)
  end

  it "raises ApiError on server error" do
    stub_request(:get, "#{base}/aspsps?country=DE")
      .to_return(status: 500, body: '{"error":"internal"}')

    expect { client.list_aspsps(country: "DE") }.to raise_error(EnableBanking::ApiError)
  end
end
