module EnableBanking
  class Client
    BASE_URL = "https://api.enablebanking.com"

    def initialize(app_id:, private_key_pem:)
      @jwt_generator = JwtGenerator.new(app_id: app_id, private_key_pem: private_key_pem)
    end

    def list_aspsps(country:)
      get("/aspsps", country: country)
    end

    def start_authorization(aspsp:, state:, redirect_url:, valid_until:)
      post("/auth", {
        access: { valid_until: valid_until },
        aspsp: aspsp,
        state: state,
        redirect_url: redirect_url,
        psu_type: "personal"
      })
    end

    def create_session(code:)
      post("/sessions", { code: code })
    end

    def get_session(session_id:)
      get("/sessions/#{session_id}")
    end

    def delete_session(session_id:)
      delete("/sessions/#{session_id}")
    end

    def account_details(account_uid:)
      get("/accounts/#{account_uid}/details")
    end

    def account_balances(account_uid:)
      get("/accounts/#{account_uid}/balances")
    end

    def account_transactions(account_uid:, date_from:, date_to:, continuation_key: nil)
      params = { date_from: date_from, date_to: date_to }
      params[:continuation_key] = continuation_key if continuation_key
      get("/accounts/#{account_uid}/transactions", **params)
    end

    private

    def get(path, **params)
      uri = URI("#{BASE_URL}#{path}")
      uri.query = URI.encode_www_form(params) if params.any?

      request = Net::HTTP::Get.new(uri)
      execute(uri, request)
    end

    def post(path, body)
      uri = URI("#{BASE_URL}#{path}")
      request = Net::HTTP::Post.new(uri)
      request.body = body.to_json
      request["Content-Type"] = "application/json"
      execute(uri, request)
    end

    def delete(path)
      uri = URI("#{BASE_URL}#{path}")
      request = Net::HTTP::Delete.new(uri)
      execute(uri, request)
    end

    def execute(uri, request)
      request["Authorization"] = "Bearer #{@jwt_generator.generate}"

      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
        http.request(request)
      end

      handle_response(response)
    end

    def handle_response(response)
      case response.code.to_i
      when 200..299
        return nil if response.body.nil? || response.body.empty?
        JSON.parse(response.body, symbolize_names: true)
      when 429
        raise RateLimitError.new(status: 429, body: response.body)
      else
        raise ApiError.new(status: response.code.to_i, body: response.body)
      end
    end
  end
end
