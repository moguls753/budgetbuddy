class SyncAllAccountsJob < ApplicationJob
  queue_as :default

  def perform
    BankConnection.active.find_each do |bc|
      SyncAccountsJob.perform_later(bc.id)
    end
  end
end
