class CategorySuggester
  MAX_TRANSACTIONS = 100

  def initialize(user, locale: :en)
    @user = user
    @credential = user.llm_credential
    @locale = locale
  end

  def suggest
    raise "LLM not configured" unless @credential

    transactions = @user.transaction_records.uncategorized.order(booking_date: :desc).limit(MAX_TRANSACTIONS)
    return { suggestions: [] } if transactions.empty?

    existing_names = @user.categories.pluck(:name)

    begin
      response = call_llm(transactions, existing_names)
      suggestions = parse_response(response)
    rescue => e
      Rails.logger.error("CategorySuggester error: #{e.message}")
      return { suggestions: [] }
    end

    # Deduplicate against existing categories (case-insensitive)
    existing_downcased = existing_names.map(&:downcase).to_set
    suggestions = suggestions
      .select { |s| s.is_a?(String) && s.present? }
      .reject { |s| existing_downcased.include?(s.downcase) }
      .first(10)

    { suggestions: suggestions }
  end

  private

  def call_llm(transactions, existing_names)
    uri = URI("#{@credential.base_url.chomp('/')}/chat/completions")
    headers = { "Content-Type" => "application/json" }
    headers["Authorization"] = "Bearer #{@credential.api_key}" if @credential.api_key.present?

    body = {
      model: @credential.llm_model,
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: user_prompt(transactions, existing_names) }
      ],
      temperature: 0
    }

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    http.open_timeout = 30
    http.read_timeout = 60

    response = http.post(uri.request_uri, body.to_json, headers)

    unless response.code.to_i.between?(200, 299)
      raise "LLM API error: HTTP #{response.code}"
    end

    data = JSON.parse(response.body)
    data.dig("choices", 0, "message", "content") || raise("No content in LLM response")
  end

  def system_prompt
    locale_language = case @locale.to_s
    when "de" then "German"
    else "English"
    end

    <<~PROMPT.strip
      <role>
      You are a personal finance category advisor. Your task is to suggest new spending/income categories based on uncategorized bank transactions.
      </role>

      <rules>
      - Suggest up to 10 new category names that would cover the uncategorized transactions
      - Category names should be short (1-4 words), clear, and general enough to cover multiple similar transactions
      - Do NOT suggest categories that already exist in the <existing_categories> list
      - Do NOT suggest overly specific categories for single merchants — group similar transactions
      - Suggest names in #{locale_language}
      - Respond with ONLY a JSON array of category name strings
      </rules>

      <response_format>
      ["Category One", "Category Two", "Category Three"]
      </response_format>
    PROMPT
  end

  def user_prompt(transactions, existing_names)
    lines = transactions.map do |t|
      parts = []
      parts << t.remittance if t.remittance.present?
      parts << "creditor: #{t.creditor_name}" if t.creditor_name.present?
      parts << "debtor: #{t.debtor_name}" if t.debtor_name.present?
      parts << t.bank_transaction_code if t.bank_transaction_code.present?
      "- #{parts.join(' | ')}"
    end

    <<~PROMPT.strip
      <existing_categories>
      #{existing_names.join(', ')}
      </existing_categories>

      <transactions>
      #{lines.join("\n")}
      </transactions>
    PROMPT
  end

  def parse_response(content)
    json_str = content.strip
    json_str = json_str.match(/```(?:json)?\s*(.*?)\s*```/m)&.[](1) || json_str
    parsed = JSON.parse(json_str)
    parsed.is_a?(Array) ? parsed : []
  rescue JSON::ParserError => e
    Rails.logger.error("CategorySuggester parse error: #{e.message}")
    []
  end
end
