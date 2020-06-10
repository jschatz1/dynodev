require "uuidtools"
require 'jwt'

class Api::V1::CliController < ApplicationController
  before_action :authorize_cli, only: [:cli_say_hello]
  def auth
    uuid = UUIDTools::UUID.random_create.to_s
    secret = ENV["SECRET_KEY"]
    payload = { data: uuid }

    render json: {
      browser_url: "/api/v1/cli/auth/browser/#{uuid}",
      cli_url: "/api/v1/cli/auth",
      token: JWT.encode(payload, secret, 'HS256')
    }
  end

  def browser_auth
    payload = {data: params[:uuid], from: "cli"}
    secret = ENV["SECRET_KEY"]
    token = JWT.encode(payload, secret, 'HS256')
    redirect_to "/auth/github?state=#{token}"
  end

  def cli_auth_from_token
    secret = ENV["SECRET_KEY"]
    begin
      decoded_token = JWT.decode bearer_token, secret, true, { algorithm: 'HS256' }
      key = decoded_data(decoded_token, "data")
      user_key = Key.find_by(uuid: key)
      user_key.uuid = ""
      user_key.save!
      json_response({msg: "Login to CLI Successful", token: user_key.access})
    rescue Exception => e
      json_response({msg: "Invalid token"}, :bad_request)
    end
  end

  def cli_say_hello
    json_response({msg: "Hey #{@current_user.name}!
  This is the server, speaking to you from another dimension.
  Looks like everything is working!
  Did you create a project yet?
  Navigate to one of your frontend projects and run `dyno init`"});
  end

private
  def bearer_token
    pattern = /^Bearer /
    header  = request.headers['Authorization']
    header.gsub(pattern, '') if header && header.match(pattern)
  end

end
