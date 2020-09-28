require "json"
require "pp"

class Api::V1::SchemasController < ApplicationController
  before_action :set_schema, only: [:show, :edit, :update, :destroy]
  before_action :authorize_cli, only: [:create]
  # GET /schemas
  # GET /schemas.json
  def index
    @project = Project.find_by(uuid: params[:project_id])
    if @project.nil?
      not_found
    end
    @schema = Schema.order(created_at: :desc).find_by(project_id: @project.id)
    pp @schema
    render json: @schema
    # @schemas = Schema.all
  end

  # GET /schemas/1
  # GET /schemas/1.json
  def show
    @project = Project.find_by(uuid: params[:project_id])
    @schema = Schema.find_by(id: params[:id], project_id: @project.id)
    render json: @schema
  end

  # GET /schemas/new
  def new
    @schema = Schema.new
  end

  # GET /schemas/1/edit
  def edit
  end

  # POST /schemas
  # POST /schemas.json
  def create
    @project = Project.find_by(uuid: params[:project_id], user_id: @current_user.id)
    if @project.nil?
      not_found
    end
    schema_name = "#{@current_user.name.downcase}_#{@project.name}"
    attributes = schema_params.clone
    contents = attributes[:contents]
    schemaFileService = SchemaFileService.new(contents)
    begin
      schemaFileService.validateProject
      attributes[:contents] = schemaFileService.addNameHelpers
      attributes[:original] = contents
      schemaFileService.migrate("#{@current_user.name.downcase}_#{@project.name}")
      @schema = Schema.new(attributes)
      @schema.project_id = @project.id
    rescue Exception => e
      return render json: {error: e.to_s}  , status: :unprocessable_entity
    end

    if @schema.save
      render json: @schema
    else
      puts @schema.errors
      render json: @schema.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /schemas/1
  # PATCH/PUT /schemas/1.json
  def update
    respond_to do |format|
      if @schema.update(schema_params)
        format.html { redirect_to @schema, notice: 'Schema was successfully updated.' }
        format.json { render :show, status: :ok, location: @schema }
      else
        format.html { render :edit }
        format.json { render json: @schema.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /schemas/1
  # DELETE /schemas/1.json
  def destroy
    @schema.destroy
    respond_to do |format|
      format.html { redirect_to schemas_url, notice: 'Schema was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_schema
      @schema = Schema.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def schema_params
      params.require(:schema).permit(:contents)
    end
end
