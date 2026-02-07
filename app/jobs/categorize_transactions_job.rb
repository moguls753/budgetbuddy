class CategorizeTransactionsJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    LlmCategorizer.new(User.find(user_id)).categorize_uncategorized
  end
end
