module EnableBanking
  class ApiError < StandardError
    attr_reader :status, :body

    def initialize(status:, body:)
      @status = status
      @body = body
      super("Enable Banking API error #{status}: #{body}")
    end
  end
end
