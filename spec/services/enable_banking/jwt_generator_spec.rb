require "rails_helper"

RSpec.describe EnableBanking::JwtGenerator do
  let(:key) { OpenSSL::PKey::RSA.generate(2048) }
  let(:generator) { described_class.new(app_id: "test-app-id", private_key_pem: key.to_pem) }

  it "generates a valid RS256 JWT" do
    token = generator.generate
    decoded = JWT.decode(token, key.public_key, true, algorithm: "RS256")

    payload = decoded.first
    headers = decoded.last

    expect(headers["alg"]).to eq("RS256")
    expect(headers["kid"]).to eq("test-app-id")
    expect(payload["iss"]).to eq("enablebanking.com")
    expect(payload["aud"]).to eq("api.enablebanking.com")
    expect(payload["exp"] - payload["iat"]).to eq(3600)
  end
end
