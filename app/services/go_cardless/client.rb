module GoCardless
  require 'faraday'
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

    def create_requisition(institution_id:, redirect:)
      post("requisitions/", body: {
        institution_id:,
        redirect:
      })
    end

    def requisition_active?(requisition_id:)
      resp = fetch_requisition(requisition_id)
      return false unless resp
      resp["status"] != "EX"
    end

    def get_accounts(requisition_id:)
      get("requisitions/#{requisition_id}/")
    end

    def list_transactions(account_id:, date_from: nil, date_to: nil)
      params = {}
      params[:date_from] = date_from if date_from
      params[:date_to]   = date_to   if date_to
      resp = get("accounts/#{account_id}/transactions/", params: params)
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

    private

    def request(method, path, params: {}, body: {})
      response = @conn.send(method, path) do |req|
        req.headers["Authorization"] = "Bearer #{@access_token}"
        req.headers["Content-Type"] = "application/json"
        req.params = params if method == :get
        req.body   = body.to_json  if method == :post
      end
      JSON.parse(response.body)
    end

    def setup_connection
      @conn = Faraday.new(url: BASE_URL) do |f|
        f.request  :json
        f.response :raise_error
      end
    end

    def fetch_requisition(requisition_id)
      get("requisitions/#{requisition_id}/")
    rescue Faraday::ResourceNotFound
      nil
    end
  end
end
