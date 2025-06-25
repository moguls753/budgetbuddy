class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :load_sidebar_data

  private

  def load_sidebar_data
    @accounts = Current.user.accounts
  end
end
