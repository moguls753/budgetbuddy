module GoCardless
  class ApiError < StandardError
    attr_reader :status, :body

    def initialize(status:, body:)
      @status = status
      @body = body
      super("GoCardless API error #{status}: #{body}")
    end
  end
end
