Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :financial_analyses, only: :create
      resources :stock_analyses, only: :create
      resources :report_summaries, only: :create
      resources :news_insights, only: :create
      resources :analysis_sessions, only: [:index, :show]
    end
  end
end
