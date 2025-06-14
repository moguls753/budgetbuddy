class HomeController < ApplicationController
  def index
    @transactions = User.first.bank_connections.first.accounts.first.transaction_records.all.limit(1000)
  end
end
