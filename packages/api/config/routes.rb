Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :projects do 
        resources :schemas
      end
      post 'cli/auth', action: :auth, controller: 'cli'
      get 'cli/auth/browser/:uuid', action: :browser_auth, controller: 'cli'
      get 'cli/auth/', action: :cli_auth_from_token, controller: 'cli'
    end
  end
  resources :projects
  get '/' => 'welcome#index', as: 'home'
  get 'auth/:provider/callback', to: 'sessions#create'
  get 'signout', to: 'sessions#destroy', as: 'signout'

end
