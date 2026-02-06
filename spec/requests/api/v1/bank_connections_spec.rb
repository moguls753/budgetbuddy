require "rails_helper"

RSpec.describe "Api::V1::BankConnections", type: :request do
  let(:user) { create(:user, password: "password123") }
  before { post session_path, params: { email_address: user.email_address, password: "password123" }, as: :json }

  describe "POST /api/v1/bank_connections (EB)" do
    it "creates pending connection and returns redirect_url" do
      create(:enable_banking_credential, user: user)
      eb_client = instance_double(EnableBanking::Client)
      allow(EnableBanking::Client).to receive(:new).and_return(eb_client)
      allow(eb_client).to receive(:start_authorization).and_return(eb_auth_response)

      post api_v1_bank_connections_path, params: {
        provider: "enable_banking", institution_id: "SPARKASSE_DE", country_code: "DE"
      }, as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["redirect_url"]).to be_present
      expect(BankConnection.last.status).to eq("pending")
    end
  end

  describe "POST /api/v1/bank_connections (GC)" do
    it "creates pending connection and returns redirect_url" do
      create(:go_cardless_credential, :with_token, user: user)
      gc_client = instance_double(GoCardless::Client)
      allow(GoCardless::Client).to receive(:new).and_return(gc_client)
      allow(gc_client).to receive(:create_requisition).and_return(gc_requisition_response)

      post api_v1_bank_connections_path, params: {
        provider: "gocardless", institution_id: "TOMORROW_SOBKDEBB", country_code: "DE"
      }, as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["redirect_url"]).to include("gocardless.com")
      expect(BankConnection.last.requisition_id).to eq("req-uuid-1234")
    end
  end

  describe "GET /callback (EB)" do
    it "completes authorization and redirects" do
      create(:enable_banking_credential, user: user)
      bc = create(:bank_connection, :pending, user: user, provider: "enable_banking")
      eb_client = instance_double(EnableBanking::Client)
      allow(EnableBanking::Client).to receive(:new).and_return(eb_client)
      allow(eb_client).to receive(:create_session).and_return(eb_session_response)

      get callback_api_v1_bank_connection_path(bc), params: { code: "auth-code" }

      expect(response).to redirect_to("/?bank_connection_success=#{bc.id}")
      bc.reload
      expect(bc.status).to eq("authorized")
      expect(bc.accounts.count).to eq(2)
    end
  end

  describe "GET /callback with error" do
    it "marks connection as error and redirects" do
      bc = create(:bank_connection, :pending, user: user)

      get callback_api_v1_bank_connection_path(bc), params: { error: "access_denied" }

      expect(response).to redirect_to("/?bank_connection_error=#{bc.id}")
      expect(bc.reload.status).to eq("error")
    end
  end

  describe "GET /api/v1/bank_connections" do
    it "returns user connections with accounts" do
      bc = create(:bank_connection, user: user)
      create(:account, bank_connection: bc)

      get api_v1_bank_connections_path, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.first["accounts"].length).to eq(1)
    end
  end

  describe "DELETE /api/v1/bank_connections/:id" do
    it "destroys connection" do
      bc = create(:bank_connection, user: user)
      delete api_v1_bank_connection_path(bc), as: :json
      expect(response).to have_http_status(:no_content)
      expect(BankConnection.find_by(id: bc.id)).to be_nil
    end
  end
end
