require 'uuidtools'
require 'jwt'

class SessionsController < ApplicationController
  def create
    @user = User.find_or_create_from_auth_hash(auth_hash)
    auth_has_state = params_hash.has_key?('state')
    if auth_has_state
      token = request.env['omniauth.params']['state']
      secret = ENV['SECRET_KEY']
      decoded_token = JWT.decode token, secret, true, { algorithm: 'HS256' }
      data = decoded_data(decoded_token, "data")
      if !data.nil?
        access_token_uuid = UUIDTools::UUID.random_create.to_s
        payload = {data: @user.id, uuid: access_token_uuid}
        new_key = Key.new
        new_key.uuid = decoded_token[0]['data']
        new_key.access = JWT.encode(payload, secret, 'HS256')
        new_key.save!
        @user.key = new_key
        @user.save!
        render json: {:msg => "Login Successful. You may close your browser now", :code => "beep beep boop bop"}
      end
    else
      session[:user_id] = @user.id 
      redirect_to projects_path
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to home_path
  end

  protected

  def params_hash
    request.env['omniauth.params']
  end

  def auth_hash
    request.env['omniauth.auth']
  end
end