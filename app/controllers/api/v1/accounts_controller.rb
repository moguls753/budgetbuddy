module Api
  module V1
    class AccountsController < ApplicationController
      def index
        render json: []
      end

      def show
        render json: {}
      end
    end
  end
end
