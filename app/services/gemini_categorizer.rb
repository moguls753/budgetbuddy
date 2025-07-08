class GeminiCategorizer
  def initialize(user:)
    @api_key = Rails.application.credentials.gemini_api_key
    @user = user
  end

  def self.categorize(remittance, user:)
    new(user: user).categorize(remittance)
  end

  def categorize(remittance)
    return nil if remittance.blank?

    prompt = build_prompt(remittance)
    response = call_gemini_api(prompt)
    parse_response(response)
  end

  private

  def categories
    @categories ||= @user.categories.pluck(:name)
  end

  def build_prompt(remittance)
    <<~PROMPT
      Du bist ein Transaktions-Kategorisierer. Kategorisiere die folgende deutsche Transaktionsbeschreibung in eine dieser Kategorien:

      #{categories.join(', ')}

      Transaktionsbeschreibung: "#{remittance}"

      Antworte nur mit dem Kategorienamen, sonst nichts.
    PROMPT
  end

  def call_gemini_api(prompt)
    require "net/http"
    require "json"

    uri = URI("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=#{@api_key}")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri)
    request["Content-Type"] = "application/json"

    request.body = {
      contents: [ {
        parts: [ {
          text: prompt
        } ]
      } ]
    }.to_json

    response = http.request(request)

    if response.code == "200"
      result = JSON.parse(response.body)
      result.dig("candidates", 0, "content", "parts", 0, "text")
    else
      Rails.logger.error "Gemini API error: #{response.code} - #{response.body}"
      nil
    end
  rescue => e
    Rails.logger.error "Gemini API exception: #{e.message}"
    nil
  end

  def parse_response(response)
    category = response.to_s.strip
    categories.include?(category) ? category : "Other"
  end
end
