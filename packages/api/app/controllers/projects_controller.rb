class ProjectsController < ApplicationController
  before_action :authorize, only: [:index]

  def index
    @projects = current_user.projects
    respond_to do |format|
      format.html
      format.json  { render :json => @projects }
    end
  end

  # POST /projects
  # POST /projects.json
  def create
    @project = Project.new(project_params)
    if @project.save
      render json: @project
    else
      render json: @project.errors, status: :unprocessable_entity
    end

    current_user.projects << @project
  end


  private
  # Only allow a list of trusted parameters through.
    def project_params
      params.require(:project).permit(:name, :description)
    end
end