module GoCardless
  require "faraday"
  class Client
    BASE_URL = "https://bankaccountdata.gocardless.com/api/v2/"

    def initialize
      setup_connection
      token = GoCardlessToken.fetch_valid!
      @access_token = token.access_token
    end

    def list_institutions(country:)
      get("institutions/", params: { country: country })
    end

    # optional
    def create_agreement(institution_id:, max_days:, access_days:, scope:)
      post("agreements/enduser/", body: {
        institution_id: institution_id,
        max_historical_days: max_days,
        access_valid_for_days: access_days,
        access_scope: scope
      })
    end

    def create_requisition(institution_id:, redirect:, agreement: nil)
      body = {
        institution_id: institution_id,
        redirect:       redirect
      }
      body[:agreement] = agreement if agreement

      post("requisitions/", body: body)
    end

    def get_requisition(requisition_id:)
      get("requisitions/#{requisition_id}/")
    end

    def get_requisitions
      get("requisitions/")
    end

    def requisition_active?(requisition_id:)
      resp = fetch_requisition(requisition_id)
      return false unless resp
      resp["status"] != "EX"
    end

    def get_account(account_id:)
      get("accounts/#{account_id}/")
    end

    def get_details(account_id:)
      get("accounts/#{account_id}/details/")
    end

    def get_balances(account_id:)
      get("accounts/#{account_id}/balances/")
    end

    def get_transactions(account_id:, date_from: nil, date_to: nil)
      params = {}
      params[:date_from] = date_from if date_from
      params[:date_to]   = date_to   if date_to
      begin
        resp = get("accounts/#{account_id}/transactions/", params: params)
      rescue Faraday::TooManyRequestsError => e
        binding.pry
      end
      resp["transactions"]["booked"] + resp["transactions"]["pending"]
    end

    def self.new_without_token
      client = allocate
      client.setup_connection
      client.instance_variable_set(:@access_token, nil)
      client
    end

    def get(path, params: {})
      request(:get, path, params: params)
    end

    def post(path, body:)
      request(:post, path, body: body)
    end

    def setup_connection
      @conn = Faraday.new(url: BASE_URL) do |f|
        f.request  :json
        f.response :raise_error
      end
    end

    private

    def request(method, path, params: {}, body: {})
      response = @conn.send(method, path) do |req|
        req.headers["Authorization"] = "Bearer #{@access_token}"
        req.headers["Content-Type"] = "application/json"
        req.params = params if method == :get
        req.body   = body.to_json  if method == :post
      end

      puts "Rate Limit: #{response.headers['http_x_ratelimit_limit']}"
      puts "Rate Limit - Remaining: #{response.headers['http_x_ratelimit_remaining']}"
      puts "Rate Limit - Reset: #{response.headers['http_x_ratelimit_reset']}"

      JSON.parse(response.body)
    end

    def fetch_requisition(requisition_id)
      get("requisitions/#{requisition_id}/")
    rescue Faraday::ResourceNotFound
      nil
    end
  end
end
