class AccountsController < ApplicationController
  def show
    @account = Current.user.accounts.find(params[:id])
    @transactions = @account.transaction_records.order("booking_date DESC").map(&:to_frontend_json)
    @account_json = @account.to_frontend_json
  end
end
