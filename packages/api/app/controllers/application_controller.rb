class ApplicationController < ActionController::Base
  include Response
  include Tokens
  skip_before_action :verify_authenticity_token
  before_action :set_format

  @@api = "/api/v1/"

  def set_format
    puts request.path
    if request.path.include? @@api
      request.format = "json"
    else
      request.format = "html"
    end
  end



private 
  
  def current_user
    begin
      @current_user ||= User.find(session[:user_id]) if session[:user_id]
    rescue
      @current_user = nil
      session[:user_id] = nil
      redirect_to "/"
    end
  end

  helper_method :current_user
end
