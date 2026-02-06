class SyncAccountsJob < ApplicationJob
  queue_as :default

  def perform(bank_connection_id)
    # Phase 4: implement sync logic
  end
end
