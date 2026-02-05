module Api
  module V1
    class TransactionsController < ApplicationController
      def index
        render json: []
      end
    end
  end
end
