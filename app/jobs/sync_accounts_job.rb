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
      Rails.cache.clear
      cached_data = Rails.cache.fetch("account_data:#{acct_id}", expires_in: 6.hours) do
        {
          account_data: client.get_account(account_id: acct_id),
          balances: client.get_balances(account_id: acct_id),
          transactions: client.get_transactions(account_id: acct_id)
        }
      end

      acct_data = cached_data[:account_data]
      balances = cached_data[:balances]
      transactions = cached_data[:transactions]

      account   = bc.accounts.find_or_initialize_by(account_id: acct_id)
      interim_available = balances["balances"].select { |a| a["balanceType"]=="interimAvailable" }.first["balanceAmount"]["amount"]
      interim_booked = balances["balances"].select { |a| a["balanceType"]=="interimBooked" }.first["balanceAmount"]["amount"]
      closing_booked = balances["balances"].select { |a| a["balanceType"]=="closingBooked" }.first["balanceAmount"]["amount"]

      account.update!(
        iban:     acct_data["iban"],
        name:     acct_data["ownerName"] || acct_data["name"],
        currency: acct_data["currency"],
        status:   acct_data["status"],
        interim_available:,
        interim_booked:,
        closing_booked:,
      )

      transactions.each do |t|
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
    end
  end
end
