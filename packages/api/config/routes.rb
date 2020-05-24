Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :projects do 
        resources :schemas
      end
    end
  end
  get '/' => "welcome#index"
end
