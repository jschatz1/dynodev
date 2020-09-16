require 'pp'

class Api::V1::InvitesController < ApplicationController
  before_action :set_invite, only: [:check]
  before_action :authorize_cli, only: [:check]

  def check
    unless @invite.nil?
      @current_user.updateUserInvited
      @invite.destroy!
      json_response({msg: "OK"})
    else
      not_found
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_invite
      puts "private"
      @invite = Invite.find_by(code: params[:code].upcase.strip)
    end

    # Only allow a list of trusted parameters through.
    def schema_params
      params.require(:invite).permit(:code)
    end
end