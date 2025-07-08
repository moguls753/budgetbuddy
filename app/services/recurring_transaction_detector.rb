class RecurringTransactionDetector
  def initialize(account:)
    @api_key = Rails.application.credentials.gemini_api_key
    @account = account
    @user = account.bank_connection.user
  end

  def self.detect_for_account(account:, months_back: 6)
    new(account: account).detect_recurring_transactions(months_back: months_back)
  end

  def detect_recurring_transactions(months_back: 6)
    transactions_data = collect_transaction_data(months_back)
    return [] if transactions_data.empty?

    prompt = build_detection_prompt(transactions_data)
    response = call_gemini_api(prompt)
    parse_recurring_response(response)
  end

  private

  def collect_transaction_data(months_back)
    start_date = months_back.months.ago

    @account.transaction_records
            .where(booking_date: start_date..)
            .where('amount < 0')  # Only outgoing transactions
            .map do |tx|
      {
        date: tx.booking_date.to_s,
        remittance: tx.remittance,
        amount: tx.amount.to_f.to_s,
        category: tx.category
      }
    end
  end

  def build_detection_prompt(transactions_data)
    user_categories = @user.categories.pluck(:name).join(", ")

    <<~PROMPT
      Du bist ein Experte für die Erkennung wiederkehrender Transaktionen und Abonnements.
      Analysiere die folgenden ausgehenden Transaktionen eines einzelnen Kontos und identifiziere wiederkehrende Muster.

      Transaktionen (JSON):
      #{transactions_data.to_json}

      Verfügbare Kategorien: #{user_categories}

      Finde wiederkehrende Transaktionen mit folgenden Kriterien:
      - NUR ausgehende Transaktionen (negative Beträge) analysieren
      - Mindestens 3 Vorkommen
      - Ähnliche Beträge (±5% Toleranz)
      - Regelmäßige Zeitabstände (wöchentlich, monatlich, jährlich)
      - Ähnliche Beschreibungen
      - KEINE Einnahmen oder positive Beträge berücksichtigen

      Antworte nur mit JSON in diesem Format:
      {
        "recurring_transactions": [
          {
            "pattern": "Beschreibungsmuster",
            "frequency": "monthly|weekly|yearly",
            "amount": "Durchschnittsbetrag",
            "category": "Eine der verfügbaren Kategorien",
            "confidence": "high|medium|low",
            "occurrences": "Anzahl gefundener Vorkommen"
          }
        ]
      }
    PROMPT
  end

  def call_gemini_api(prompt)
    require "net/http"
    require "json"

    uri = URI("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=#{@api_key}")

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

  def parse_recurring_response(response)
    return [] unless response

    # Remove markdown code blocks if present
    cleaned_response = response.gsub(/```json\n?/, "").gsub(/```\n?/, "").strip

    JSON.parse(cleaned_response)["recurring_transactions"] || []
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse recurring transactions response: #{e.message}"
    Rails.logger.error "Response was: #{response}"
    []
  end
end
