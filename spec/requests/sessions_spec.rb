require "rails_helper"

RSpec.describe "Sessions", type: :request do
  let!(:user) { create(:user, email_address: "test@example.com", password: "password123") }

  describe "POST /session" do
    it "logs in with valid credentials" do
      post session_path, params: { email_address: "test@example.com", password: "password123" }, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["email_address"]).to eq("test@example.com")
    end

    it "rejects invalid credentials" do
      post session_path, params: { email_address: "test@example.com", password: "wrong" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /session" do
    it "logs out" do
      post session_path, params: { email_address: "test@example.com", password: "password123" }, as: :json
      delete session_path, as: :json
      expect(response).to have_http_status(:no_content)
    end
  end
end
