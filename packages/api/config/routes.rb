Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :projects do 
        resources :schemas
      end
      post 'cli/auth', action: :auth, controller: 'cli'
      post 'cli/:project_id/create_oauth2_client', action: :create_oauth2_client, controller: 'cli'
      get 'cli/auth/browser/:uuid', action: :browser_auth, controller: 'cli'
      get 'cli/auth', action: :cli_auth_from_token, controller: 'cli'
      get 'cli/hello', action: :cli_say_hello, controller: 'cli'
      get 'cli/:project_id/auth_initialized', action: :cli_auth_initialized, controller: 'cli'
      get 'cli/:project_id/routes', action: :get_routes, controller: 'cli'
      get 'users/user', action: :show, controller: 'users'
    end
  end
  resources :projects
  get '/' => 'welcome#index', as: 'home'
  get 'auth/:provider/callback', to: 'sessions#create'
  get 'signout', to: 'sessions#destroy', as: 'signout'

end
