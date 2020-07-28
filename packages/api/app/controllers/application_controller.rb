class ApplicationController < ActionController::Base
  include Response
  include Tokens
  skip_before_action :verify_authenticity_token
  before_action :set_format

  @@api = "/api/v1/"

  Unauthenticated = Class.new(ActionController::RoutingError)

  rescue_from ApplicationController::Unauthenticated do |exception|
    render json: {status: "Unauthenticated", msg: "User is not authenticated. Sign in to continue"}, status: 401
  end

  def set_format
    puts request.path
    if request.path.include? @@api
      request.format = "json"
    else
      request.format = "html"
    end
  end

protected
  def authenticate_request!

  end

private

  def current_user_cli
    token = auth_token
    user_id = decoded_data(token, "data")
    uuid = decoded_data(token, "uuid")
    {user_id: user_id, uuid: uuid}
  end
  
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

  def project_schema
    if @project
      @project_schema = nil
    else
      @project_schema = "#{@current_user.name}_#{@project.name}"
    end
  end

  def authorize_cli
    begin
      user_id = current_user_cli[:user_id]
      @current_user ||= User.find(user_id)
    rescue
      @current_user = nil
      raise ApplicationController::Unauthenticated.new("Unable to authenticate user")
    end
  end

  def authorize
    redirect_to "/", alert: "Not authorized" if current_user.nil?
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end
  
end
