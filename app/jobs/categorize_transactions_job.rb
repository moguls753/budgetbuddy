class CategorizeTransactionsJob < ApplicationJob
  queue_as :default

  def perform(account_id: nil, limit: 50)
    scope = if account_id
              TransactionRecord.joins(:account).where(account: { id: account_id })
    else
              TransactionRecord.all
    end

    uncategorized_transactions = scope.where(category: nil)
                                     .where.not(remittance: [ nil, "" ])
                                     .limit(limit)

    Rails.logger.info "Categorizing #{uncategorized_transactions.count} transactions"

    uncategorized_transactions.find_each.with_index do |transaction, index|
      begin
        transaction.categorize_with_ai!
        Rails.logger.info "Categorized transaction #{transaction.remittance}: #{transaction.category}"

        Rails.logger.info "Waiting 2 seconds before next categorization..."
        sleep(2)
      rescue => e
        Rails.logger.error "Failed to categorize transaction #{transaction.remittance}: #{e.message}"
      end
    end
  end
end
