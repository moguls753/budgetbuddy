Rails.application.routes.draw do
  resource :session, only: %i[ new create destroy ]
  resource :user, only: %i[ create ]
  resources :passwords, param: :token
  get "me", to: "users#me"

  namespace :api do
    namespace :v1 do
      resources :accounts, only: %i[ index show ]
      resources :transactions, only: %i[ index ]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
