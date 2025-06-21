class HomeController < ApplicationController
  def index
    @transactions = User.first.bank_connections.first.accounts.first.transaction_records.all.order("booking_date DESC")
    @balances_json = User.first.accounts.map(&:balances_json)

    # ratelimits und andere info felder
    @details_json = User.first.accounts.map(&:details_json)
  end
end
