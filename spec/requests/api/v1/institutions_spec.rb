require "rails_helper"

RSpec.describe "Api::V1::Institutions", type: :request do
  let(:user) { create(:user, password: "password123") }
  before { post session_path, params: { email_address: user.email_address, password: "password123" }, as: :json }

  it "returns EB institutions" do
    create(:enable_banking_credential, user: user)
    eb_client = instance_double(EnableBanking::Client)
    allow(EnableBanking::Client).to receive(:new).and_return(eb_client)
    allow(eb_client).to receive(:list_aspsps).with(country: "DE").and_return(eb_aspsps_response)

    get api_v1_institutions_path, params: { provider: "enable_banking", country: "DE" }, as: :json
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.first["name"]).to eq("Sparkasse Berlin")
  end

  it "returns GC institutions" do
    create(:go_cardless_credential, :with_token, user: user)
    gc_client = instance_double(GoCardless::Client)
    allow(GoCardless::Client).to receive(:new).and_return(gc_client)
    allow(gc_client).to receive(:list_institutions).with(country: "DE").and_return(gc_institutions_response)

    get api_v1_institutions_path, params: { provider: "gocardless", country: "DE" }, as: :json
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.first["name"]).to eq("Tomorrow")
  end

  it "returns 422 when credentials not configured" do
    get api_v1_institutions_path, params: { provider: "enable_banking", country: "DE" }, as: :json
    expect(response).to have_http_status(:unprocessable_content)
  end
end
