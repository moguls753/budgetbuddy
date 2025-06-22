class HomeController < ApplicationController
  def index
    @stats = Statistics.new(accounts: Current.user.accounts.all).call
  end
end
