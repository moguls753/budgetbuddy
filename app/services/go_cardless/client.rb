module GoCardless
  class ApiError < StandardError
    attr_reader :status, :body

    def initialize(status:, body:)
      @status = status
      @body = body
      super("GoCardless API error #{status}: #{body}")
    end
  end

  class RateLimitError < ApiError; end

  class Client
    BASE_URL = "https://bankaccountdata.gocardless.com/api/v2"

    def initialize(credential)
      @credential = credential
      @credential.ensure_valid_token!(client: self)
    end

    def list_institutions(country:)
      get("/institutions/", country: country)
    end

    def create_requisition(institution_id:, redirect:)
      post("/requisitions/", {
        institution_id: institution_id,
        redirect: redirect
      })
    end

    def get_requisition(requisition_id:)
      get("/requisitions/#{requisition_id}/")
    end

    def account_balances(account_id:)
      get("/accounts/#{account_id}/balances/")
    end

    def account_transactions(account_id:, date_from: nil, date_to: nil)
      params = {}
      params[:date_from] = date_from if date_from
      params[:date_to] = date_to if date_to
      get("/accounts/#{account_id}/transactions/", **params)
    end

    def account_details(account_id:)
      get("/accounts/#{account_id}/details/")
    end

    # Unauthenticated token endpoints — called by GoCardlessCredential
    def obtain_token(secret_id:, secret_key:)
      post_unauthenticated("/token/new/", { secret_id: secret_id, secret_key: secret_key })
    end

    def refresh_token(refresh:)
      post_unauthenticated("/token/refresh/", { refresh: refresh })
    end

    private

    def get(path, **params)
      uri = URI("#{BASE_URL}#{path}")
      uri.query = URI.encode_www_form(params) if params.any?

      request = Net::HTTP::Get.new(uri)
      request["Authorization"] = "Bearer #{@credential.access_token}"
      execute(uri, request)
    end

    def post(path, body)
      uri = URI("#{BASE_URL}#{path}")
      request = Net::HTTP::Post.new(uri)
      request["Authorization"] = "Bearer #{@credential.access_token}"
      request["Content-Type"] = "application/json"
      request.body = body.to_json
      execute(uri, request)
    end

    def post_unauthenticated(path, body)
      uri = URI("#{BASE_URL}#{path}")
      request = Net::HTTP::Post.new(uri)
      request["Content-Type"] = "application/json"
      request.body = body.to_json
      execute(uri, request)
    end

    def execute(uri, request)
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
