require "rails_helper"

RSpec.describe "Api::V1::Categories", type: :request do
  let(:user) { create(:user, password: "password123") }
  before { post session_path, params: { email_address: user.email_address, password: "password123" }, as: :json }

  it "lists categories" do
    create(:category, user: user, name: "Groceries")
    get api_v1_categories_path, as: :json
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.first["name"]).to eq("Groceries")
  end

  it "creates a category" do
    post api_v1_categories_path, params: { category: { name: "Transport" } }, as: :json
    expect(response).to have_http_status(:created)
    expect(user.categories.count).to eq(1)
  end

  it "rejects duplicate name" do
    create(:category, user: user, name: "Transport")
    post api_v1_categories_path, params: { category: { name: "Transport" } }, as: :json
    expect(response).to have_http_status(:unprocessable_entity)
  end

  it "updates a category" do
    category = create(:category, user: user, name: "Old Name")
    patch api_v1_category_path(category), params: { category: { name: "New Name" } }, as: :json
    expect(response).to have_http_status(:ok)
    expect(category.reload.name).to eq("New Name")
  end

  it "destroys a category" do
    category = create(:category, user: user)
    delete api_v1_category_path(category), as: :json
    expect(response).to have_http_status(:no_content)
    expect(Category.find_by(id: category.id)).to be_nil
  end

  it "scopes to current user" do
    other_user = create(:user)
    other_category = create(:category, user: other_user, name: "Other")
    get api_v1_categories_path, as: :json
    expect(response.parsed_body).to be_empty
  end
end
