require "json"
require "pp"

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

  def addNameHelpers
    begin
      @model = JSON.parse(@contents)
    rescue Exception => e
      raise e
    end
    @model["models"] = @model["models"].map { |model|
      name = model["name"]
      model["pascal"] = name.camelize
      model["camel"] = name.camelize(:lower)
      model["singular"] = model["camel"].pluralize(1)
      model["plural"] = model["camel"].pluralize(2)
      model
    }
    @model.to_json
  end

end