require "rails_helper"

RSpec.describe "Users", type: :request do
  describe "POST /user" do
    it "creates a user and logs in" do
      post user_path, params: { email_address: "new@test.com", password: "password123", password_confirmation: "password123" }, as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body["email_address"]).to eq("new@test.com")
      expect(User.count).to eq(1)
    end

    it "rejects invalid signup" do
      post user_path, params: { email_address: "", password: "short" }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to be_present
    end
  end

  describe "GET /me" do
    it "returns current user when logged in" do
      user = create(:user, password: "password123")
      post session_path, params: { email_address: user.email_address, password: "password123" }, as: :json
      get me_path, as: :json
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["id"]).to eq(user.id)
    end

    it "returns 401 when not logged in" do
      get me_path, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
