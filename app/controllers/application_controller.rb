class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :load_sidebar_data

  private

  def load_sidebar_data
    @accounts = Current.user.accounts.order(:name)
    @transactions = Current.user.bank_connections.first.accounts.first.transaction_records.all.order("booking_date DESC")
    @balances_json = @accounts.map(&:balances_json)

    # ratelimits und andere info felder
    @details_json = @accounts.map(&:details_json)
  end
end
