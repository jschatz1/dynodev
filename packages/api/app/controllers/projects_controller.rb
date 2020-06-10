class ProjectsController < ApplicationController
  before_action :authorize, only: [:index]
  def index
    @projects = current_user.projects
  end
end