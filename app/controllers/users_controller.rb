class UsersController < ApplicationController
  allow_unauthenticated_access only: %i[ create ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> {
    respond_to do |format|
      format.json { render json: { error: "Try again later." }, status: :too_many_requests }
      format.html { redirect_to new_session_path, alert: "Try again later." }
    end
  }

  def create
    user = User.new(user_params)

    if user.save
      start_new_session_for user
      respond_to do |format|
        format.json { render json: user_json(user), status: :created }
        format.html { redirect_to root_path }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: user.errors.full_messages }, status: :unprocessable_content }
        format.html { render :new, status: :unprocessable_content }
      end
    end
  end

  def me
    respond_to do |format|
      format.json { render json: user_json(Current.user) }
    end
  end

  private

  def user_params
    params.permit(:email_address, :password, :password_confirmation)
  end

  def user_json(user)
    { id: user.id, email_address: user.email_address }
  end
end
