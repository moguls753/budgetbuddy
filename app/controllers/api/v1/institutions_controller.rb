module Api
  module V1
    class InstitutionsController < ApplicationController
      def index
        case params[:provider]
        when "enable_banking"
          credential = Current.user.enable_banking_credential
          return render json: { error: "Enable Banking not configured" }, status: :unprocessable_content unless credential

          client = EnableBanking::Client.new(app_id: credential.app_id, private_key_pem: credential.private_key_pem)
          result = client.list_aspsps(country: params[:country])
          render json: result[:aspsps]
        when "gocardless"
          credential = Current.user.go_cardless_credential
          return render json: { error: "GoCardless not configured" }, status: :unprocessable_content unless credential

          client = GoCardless::Client.new(credential)
          render json: client.list_institutions(country: params[:country])
        else
          render json: { error: "Invalid provider" }, status: :unprocessable_content
        end
      rescue EnableBanking::ApiError, GoCardless::ApiError => e
        render json: { error: e.message }, status: :bad_gateway
      end
    end
  end
end
