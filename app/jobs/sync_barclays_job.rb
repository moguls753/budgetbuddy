class SyncBarclaysJob < ApplicationJob
  queue_as :default

  def perform(bank_connection_id)
    bank_connection = BankConnection.find(bank_connection_id)

    unless bank_connection.barclays_scraper?
      Rails.logger.error "Attempted to sync non-Barclays connection with Barclays job"
      return
    end

    Rails.logger.info "Starting Barclays sync for bank_connection_id: #{bank_connection_id}"

    begin
      # Get credentials from the connection
      credentials = bank_connection.get_credentials

      if credentials[:username].blank? || credentials[:password].blank?
        raise ArgumentError, "Missing credentials for Barclays connection"
      end

      # Initialize scraper with user's credentials
      scraper = FinancialScraper::Barclays::Scraper.new(
        username: credentials[:username],
        password: credentials[:password]
      )

      # Scrape transactions
      scraped_data = scraper.scrape_transactions_with_details

      # Process the scraped data
      process_transactions(scraped_data, bank_connection)

      # Update connection status and timestamp
      bank_connection.update!(
        status: "linked",
        last_scraped_at: Time.current
      )

      Rails.logger.info "Barclays sync completed successfully"

    rescue FinancialScraper::Barclays::MaintenanceError => e
      Rails.logger.warn "Barclays maintenance detected: #{e.message}"
      bank_connection.update!(status: "maintenance")
      # Don't raise - this is expected and should be retried later

    rescue FinancialScraper::Barclays::LoginError => e
      Rails.logger.error "Barclays login failed: #{e.message}"
      bank_connection.update!(status: "auth_error")
      raise e
    rescue => e
      Rails.logger.error "Barclays sync failed: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      bank_connection.update!(status: "error")
      raise e
    end
  end

  private

  def process_transactions(scraped_data, bank_connection)
    return if scraped_data[:all].blank?

    # Find or create account for this connection
    # For now, create a single account per connection
    account = find_or_create_account(bank_connection)

    transactions_processed = 0

    scraped_data[:all].each do |transaction_data|
      begin
        process_single_transaction(transaction_data, account)
        transactions_processed += 1
      rescue => e
        Rails.logger.error "Failed to process transaction: #{e.message}"
        Rails.logger.error "Transaction data: #{transaction_data.inspect}"
      end
    end

    Rails.logger.info "Processed #{transactions_processed} transactions"
  end

  def find_or_create_account(bank_connection)
    # Create a default account for Barclays scraper connections
    account_id = "barclays_main_#{bank_connection.id}"

    bank_connection.accounts.find_or_create_by(account_id: account_id) do |account|
      account.name = "Barclays Main Account"
      account.currency = "EUR"
      account.status = "ready"
      account.iban = nil # Barclays scraper doesn't provide IBAN
    end
  end

  def process_single_transaction(transaction_data, account)
    transaction_id = generate_transaction_id(transaction_data, account)

    # Check if transaction already exists
    existing_transaction = account.transaction_records.find_by(transaction_id: transaction_id)

    if existing_transaction
      # Update the status in case it changed from pending to posted
      existing_transaction.update!(bank_transaction_code: transaction_data[:status])
      Rails.logger.debug "Updated existing transaction status: #{transaction_id}"
      return existing_transaction
    end

    # Create new transaction record
    account.transaction_records.create!(
      transaction_id: transaction_id,
      amount: transaction_data[:amount],
      currency: "EUR",
      booking_date: transaction_data[:date],
      value_date: transaction_data[:date],
      remittance: transaction_data[:merchant],
      creditor_name: transaction_data[:merchant],
      bank_transaction_code: transaction_data[:status]
    )
  end
  def generate_transaction_id(transaction_data, account)
    # Create a unique identifier for the transaction
    date_str = transaction_data[:date]&.strftime("%Y%m%d") || "unknown"
    amount_str = transaction_data[:amount].to_s.gsub(/[^\d\-\.]/, "")
    merchant_hash = Digest::MD5.hexdigest(transaction_data[:merchant].to_s)[0..8]

    "barclays_#{account.account_id}_#{date_str}_#{amount_str}_#{merchant_hash}"
  end
end
