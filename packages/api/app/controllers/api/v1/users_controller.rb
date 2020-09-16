class Api::V1::UsersController < ApplicationController
  before_action :authorize_cli, only: [:show, :invites]
  def show
    render json: @current_user
  end
  
  def invites
    json_response(Invite.where(user_id: @current_user.id))
  end
end