require "rails_helper"
require "webmock/rspec"

RSpec.describe GoCardless::Client do
  let(:credential) { create(:go_cardless_credential, :with_token) }
  let(:client) { described_class.new(credential) }
  let(:base) { "https://bankaccountdata.gocardless.com/api/v2" }

  it "GETs with Bearer token and parses JSON" do
    stub = stub_request(:get, "#{base}/institutions/")
      .with(query: { country: "DE" }, headers: { "Authorization" => "Bearer #{credential.access_token}" })
      .to_return(status: 200, body: gc_institutions_response.to_json)

    result = client.list_institutions(country: "DE")
    expect(stub).to have_been_requested
    expect(result.first[:name]).to eq("Tomorrow")
  end

  it "POSTs JSON body" do
    stub_request(:post, "#{base}/requisitions/")
      .to_return(status: 200, body: gc_requisition_response.to_json)

    result = client.create_requisition(institution_id: "TOMORROW_SOLDE1S", redirect: "http://localhost:3000/callback")
    expect(result[:id]).to eq("req-uuid-1234")
  end

  it "fetches new token when fully expired" do
    expired_credential = create(:go_cardless_credential, :fully_expired)

    stub_request(:post, "#{base}/token/new/")
      .to_return(status: 200, body: gc_token_response.to_json)

    described_class.new(expired_credential)

    expired_credential.reload
    expect(expired_credential.access_token).to eq("gc-access-token-abc")
  end

  it "refreshes token when only access expired" do
    expired_credential = create(:go_cardless_credential, :expired_access)

    stub_request(:post, "#{base}/token/refresh/")
      .to_return(status: 200, body: gc_refresh_response.to_json)

    described_class.new(expired_credential)

    expired_credential.reload
    expect(expired_credential.access_token).to eq("gc-access-token-refreshed")
  end

  it "raises RateLimitError on 429" do
    stub_request(:get, "#{base}/institutions/")
      .with(query: { country: "DE" })
      .to_return(status: 429, body: '{"detail":"Rate limit exceeded"}')

    expect { client.list_institutions(country: "DE") }.to raise_error(GoCardless::RateLimitError)
  end

  it "raises ApiError on server error" do
    stub_request(:get, "#{base}/institutions/")
      .with(query: { country: "DE" })
      .to_return(status: 500, body: '{"detail":"Internal server error"}')

    expect { client.list_institutions(country: "DE") }.to raise_error(GoCardless::ApiError)
  end
end
