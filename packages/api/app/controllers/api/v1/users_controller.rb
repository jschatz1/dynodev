class Api::V1::UsersController < ApplicationController
  before_action :authorize_cli, only: [:show]
  def show
    json_response(@current_user)
  end
end