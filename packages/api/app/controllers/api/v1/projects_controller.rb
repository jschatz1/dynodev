class Api::V1::ProjectsController < ApplicationController
  before_action :authorize_cli, only: [:create, :show, :index]
  before_action :set_project, only: [:show, :edit, :update, :destroy]
  after_action :create_project_schema, only: [:create]
  # GET /projects
  # GET /projects.json
  def index
    @projects = @current_user.projects
  end

  # GET /projects/1
  # GET /projects/1.json
  def show
    render json: @project
  end

  # GET /projects/new
  def new
    @project = Project.new
  end

  # GET /projects/1/edit
  def edit
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

    @current_user.projects << @project
  end

  # PATCH/PUT /projects/1
  # PATCH/PUT /projects/1.json
  def update
    respond_to do |format|
      if @project.update(project_params)
        format.json { render :show, status: :ok, location: @project }
      else
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /projects/1
  # DELETE /projects/1.json
  def destroy
    @project.destroy
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  def create_project_schema
    sql = "CREATE SCHEMA IF NOT EXISTS \"#{@current_user.name.downcase}_#{@project.name}\";"
    execution = ActiveRecord::Base.connection.execute(sql);
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_project
      @project = Project.find_by(uuid: params[:id], user_id: @current_user.id)
    end

    # Only allow a list of trusted parameters through.
    def project_params
      params.require(:project).permit(:name, :description)
    end
end
