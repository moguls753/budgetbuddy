class SyncAccountsJob < ApplicationJob
  queue_as :default

  def perform(bank_connection_id)
    bc     = BankConnection.find(bank_connection_id)
    client = GoCardless::Client.new

    unless client.requisition_active?(requisition_id: bc.requisition_id)
      new_req = client.create_requisition(
        institution_id: bc.institution_id,
        redirect:       "http://localhost.com:3000",
        agreement:      bc.agreement&.agreement_id
      )
      bc.update!(
        requisition_id: new_req["id"],
        link:           new_req["link"],
        status:         new_req["status"]
      )
    end

    req = client.get_requisition(requisition_id: bc.requisition_id)
    bc.update!(status: req["status"])
    account_ids = req["accounts"] || []

    account_ids.each do |acct_id|
      account = bc.accounts.find_or_initialize_by(account_id: acct_id)

      balances = client.get_balances_with_headers(account_id: acct_id)
      transactions = client.get_transactions_with_headers(account_id: acct_id)
      details = client.get_details_with_headers(account_id: acct_id)
      account_data = client.get_account_with_headers(account_id: acct_id)

      update_attrs = {}

      if account_data[:body].present?
        update_attrs[:iban] = account_data[:body]["iban"]
        update_attrs[:name] = account_data[:body]["ownerName"]
        update_attrs[:status] = account_data[:body]["status"]
      end

      if balances[:body].present?
        interim_available = balances[:body]["balances"].find { |a| a["balanceType"] == "interimAvailable" }&.dig("balanceAmount", "amount")
        interim_booked = balances[:body]["balances"].find { |a| a["balanceType"] == "interimBooked" }&.dig("balanceAmount", "amount")
        closing_booked = balances[:body]["balances"].find { |a| a["balanceType"] == "closingBooked" }&.dig("balanceAmount", "amount")

        update_attrs[:interim_available] = interim_available
        update_attrs[:interim_booked] = interim_booked
        update_attrs[:closing_booked] = closing_booked
      end

      if details[:body].present?
        update_attrs[:currency] = details[:body]["currency"]
      end

      update_attrs.merge!(
        balances_ratelimit: balances[:headers]["http_x_ratelimit_account_success_limit"],
        balances_ratelimit_remaining: balances[:headers]["http_x_ratelimit_account_success_remaining"],
        balances_ratelimit_reset: balances[:headers]["http_x_ratelimit_account_success_reset"],
        details_ratelimit: details[:headers]["http_x_ratelimit_account_success_limit"],
        details_ratelimit_remaining: details[:headers]["http_x_ratelimit_account_success_remaining"],
        details_ratelimit_reset: details[:headers]["http_x_ratelimit_account_success_reset"],
        transactions_ratelimit: transactions[:headers]["http_x_ratelimit_account_success_limit"],
        transactions_ratelimit_remaining: transactions[:headers]["http_x_ratelimit_account_success_remaining"],
        transactions_ratelimit_reset: transactions[:headers]["http_x_ratelimit_account_success_reset"],
        account_ratelimit: account_data[:headers]["http_x_ratelimit_limit"],
        account_ratelimit_remaining: account_data[:headers]["http_x_ratelimit_remaining"],
        account_ratelimit_reset: account_data[:headers]["http_x_ratelimit_reset"],
      )

      account.update!(update_attrs)

      if transactions[:body].present?
        transactions[:body].each do |t|
          uid = t.fetch("internalTransactionId")
          tx = account.transaction_records.find_or_initialize_by(transaction_id: uid)
          tx.assign_attributes(
            amount:                 t.dig("transactionAmount", "amount"),
            currency:               t.dig("transactionAmount", "currency"),
            booking_date:           t["bookingDate"],
            value_date:             t["valueDate"],
            remittance:             t["remittanceInformationUnstructured"],
            mandate_id:             t["mandateId"],
            creditor_id:            t["creditorId"],
            creditor_name:          t["creditorName"],
            creditor_iban:          t.dig("creditorAccount", "iban"),
            debtor_name:            t["debtorName"],
            debtor_iban:            t.dig("debtorAccount", "iban"),
            bank_transaction_code:  t["proprietaryBankTransactionCode"]
          )
          tx.save!
        end
      else
        Rails.logger.info "No transactions to process for account #{acct_id}"
      end
    end
  end
end
