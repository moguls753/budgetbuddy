class SyncAccountsJob < ApplicationJob
  queue_as :default

  def perform(bank_connection_id)
    bc     = BankConnection.find(bank_connection_id)
    client = GoCardless::Client.new

    # 1) Refresh or re-create requisition if expired
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

    # 2) Pull latest account list
    req = client.get_requisition(requisition_id: bc.requisition_id)
    bc.update!(status: req["status"])
    account_ids = req["accounts"] || []

    account_ids.each do |acct_id|
      # 3) Upsert the Account record
      acct_data = client.get("accounts/#{acct_id}/")
      account   = bc.accounts.find_or_initialize_by(account_id: acct_id)
      balances = client.get_balances(account_id: account.account_id)

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


      # 4) Fetch and persist all transactions
      transactions = client.get_transactions(account_id: acct_id)

      transactions.each do |t|
        # use internalTransactionId as your transaction_id
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
