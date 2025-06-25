class HomeController < ApplicationController
  def index
    @stats = Statistics.new(accounts: Current.user.accounts.all).call
    @transactions = @accounts.each_with_object({}) do |acc, hash|
      hash[acc.id] = acc.transaction_records.all.order("booking_date DESC").map(&:to_frontend_json)
    end

    # ratelimits und andere info felder
    @accounts_json = @accounts.map(&:to_frontend_json)
  end

  def account
  end
end
