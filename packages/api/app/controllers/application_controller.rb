class ApplicationController < ActionController::Base
  skip_before_action :verify_authenticity_token
  before_action :set_format

  @@whitelist = ["/"]

  def set_format
    if @@whitelist.include? request.path
      request.format = "html"
    else
      request.format = "json"
    end
  end
end
