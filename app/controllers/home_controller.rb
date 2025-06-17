class HomeController < ApplicationController
  def index
    @transactions = User.first.bank_connections.first.accounts.first.transaction_records.all.order("booking_date DESC")
  end
end
