require "rails_helper"

RSpec.describe LlmCategorizer do
  let(:user) { create(:user) }
  let!(:credential) { create(:llm_credential, user: user) }
  let(:bank_connection) { create(:bank_connection, user: user) }
  let(:account) { create(:account, bank_connection: bank_connection) }
  let!(:groceries) { create(:category, user: user, name: "Groceries") }
  let!(:entertainment) { create(:category, user: user, name: "Entertainment") }

  let!(:tx1) { create(:transaction_record, account: account, remittance: "REWE Markt", creditor_name: "REWE", amount: -42.50, creditor_iban: "DE89370400440532013000") }
  let!(:tx2) { create(:transaction_record, account: account, remittance: "Netflix", creditor_name: "Netflix Inc", amount: -12.99) }

  subject { described_class.new(user) }

  def stub_llm(mapping)
    body = { choices: [ { message: { content: mapping.to_json } } ] }
    response = instance_double(Net::HTTPResponse, code: "200", body: body.to_json)
    http = instance_double(Net::HTTP)
    allow(Net::HTTP).to receive(:new).and_return(http)
    allow(http).to receive(:use_ssl=)
    allow(http).to receive(:open_timeout=)
    allow(http).to receive(:read_timeout=)
    allow(http).to receive(:post).and_return(response)
    http
  end

  it "assigns categories and skips unknown names" do
    stub_llm({ tx1.id.to_s => "Groceries", tx2.id.to_s => "FakeCategory" })

    results = subject.categorize_uncategorized

    expect(tx1.reload.category).to eq(groceries)
    expect(tx2.reload.category).to be_nil
    expect(results[:categorized]).to eq(1)
  end

  it "does not send amounts or IBANs in the prompt" do
    http = stub_llm({})

    expect(http).to receive(:post) do |_uri, body, _headers|
      content = JSON.parse(body)["messages"].last["content"]
      expect(content).not_to include("42.50", "DE89")
      expect(content).to include("REWE Markt", "Netflix")
      instance_double(Net::HTTPResponse, code: "200", body: { choices: [ { message: { content: "{}" } } ] }.to_json)
    end

    subject.categorize_uncategorized
  end

  it "handles API errors gracefully" do
    response = instance_double(Net::HTTPResponse, code: "500", body: "error")
    http = instance_double(Net::HTTP)
    allow(Net::HTTP).to receive(:new).and_return(http)
    allow(http).to receive(:use_ssl=)
    allow(http).to receive(:open_timeout=)
    allow(http).to receive(:read_timeout=)
    allow(http).to receive(:post).and_return(response)

    results = subject.categorize_uncategorized

    expect(results[:failed]).to eq(2)
  end

  it "raises when LLM is not configured" do
    credential.destroy
    user.reload

    expect { described_class.new(user).categorize_uncategorized }.to raise_error("LLM not configured")
  end
end
