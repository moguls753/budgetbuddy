module EnableBanking
  class JwtGenerator
    def initialize(app_id:, private_key_pem:)
      @app_id = app_id
      @private_key = OpenSSL::PKey::RSA.new(private_key_pem)
    end

    def generate
      now = Time.now.to_i
      payload = { iss: "enablebanking.com", aud: "api.enablebanking.com", iat: now, exp: now + 3600 }
      headers = { kid: @app_id, typ: "JWT" }

      JWT.encode(payload, @private_key, "RS256", headers)
    end
  end
end
