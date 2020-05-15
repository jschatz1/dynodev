require "json"

class SchemaFileService

  def initialize(contents)
    @contents = contents
    @model = nil
  end

  def validateProject
    begin
      @model = JSON.parse(@contents)
    rescue Exception => e
      raise e
    end

    if !@model.key?("project")
      raise Exception.new "Missing project in metadata"
    end
  end

end