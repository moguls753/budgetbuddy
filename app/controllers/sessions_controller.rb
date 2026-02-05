class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> {
    respond_to do |format|
      format.json { render json: { error: "Try again later." }, status: :too_many_requests }
      format.html { redirect_to new_session_path, alert: "Try again later." }
    end
  }

  def new
  end

  def create
    if user = User.authenticate_by(params.permit(:email_address, :password))
      start_new_session_for user
      respond_to do |format|
        format.json { render json: user_json(user) }
        format.html { redirect_to after_authentication_url }
      end
    else
      respond_to do |format|
        format.json { render json: { error: "Invalid email address or password." }, status: :unauthorized }
        format.html { redirect_to new_session_path, alert: "Try another email address or password." }
      end
    end
  end

  def destroy
    terminate_session
    respond_to do |format|
      format.json { head :no_content }
      format.html { redirect_to new_session_path, status: :see_other }
    end
  end

  private

  def user_json(user)
    { id: user.id, email_address: user.email_address }
  end
end
