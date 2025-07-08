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
        Rails.logger.info "Categorized transaction #{transaction.id}: #{transaction.category}"

        # Rate limiting: sleep 12 seconds between requests (5 requests per minute limit)
        # Skip sleep after the last transaction
        if index < uncategorized_transactions.count - 1
          Rails.logger.info "Waiting 4 seconds before next categorization..."
          sleep(4)
        end
      rescue => e
        Rails.logger.error "Failed to categorize transaction #{transaction.id}: #{e.message}"
      end
    end
  end
end
