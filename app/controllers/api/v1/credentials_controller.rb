module Api
  module V1
    class CredentialsController < ApplicationController
      def show
        eb = Current.user.enable_banking_credential
        gc = Current.user.go_cardless_credential

        render json: {
          enable_banking: eb ? { configured: true, app_id: eb.app_id } : { configured: false },
          gocardless: gc ? { configured: true } : { configured: false }
        }
      end

      def create
        case params[:provider]
        when "enable_banking"
          return render json: { error: "Already configured" }, status: :conflict if Current.user.enable_banking_credential
          credential = Current.user.build_enable_banking_credential(eb_params)
        when "gocardless"
          return render json: { error: "Already configured" }, status: :conflict if Current.user.go_cardless_credential
          credential = Current.user.build_go_cardless_credential(gc_params)
        else
          return render json: { error: "Invalid provider" }, status: :unprocessable_entity
        end

        if credential.save
          render json: { provider: params[:provider], configured: true }, status: :created
        else
          render json: { errors: credential.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        case params[:provider]
        when "enable_banking"
          credential = Current.user.enable_banking_credential
          return render json: { error: "Not configured" }, status: :not_found unless credential
          credential.assign_attributes(eb_params)
        when "gocardless"
          credential = Current.user.go_cardless_credential
          return render json: { error: "Not configured" }, status: :not_found unless credential
          credential.assign_attributes(gc_params)
        else
          return render json: { error: "Invalid provider" }, status: :unprocessable_entity
        end

        if credential.save
          render json: { provider: params[:provider], configured: true }
        else
          render json: { errors: credential.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def eb_params
        params.expect(credentials: [ :app_id, :private_key_pem ])
      end

      def gc_params
        params.expect(credentials: [ :secret_id, :secret_key ])
      end
    end
  end
end
