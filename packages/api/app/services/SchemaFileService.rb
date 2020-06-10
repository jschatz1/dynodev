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
      model["pascal"] = name.pluralize(2).camelize
      model["camel"] = name.pluralize(2).camelize(:lower)
      model["pascal_singular"] = name.pluralize(1).camelize
      model["camel_singular"] = name.pluralize(1).camelize(:lower)
      model["underscore"] = name.camelize(:lower).pluralize(2).underscore
      model["dash"] = name.camelize(:lower).pluralize(2).underscore.dasherize
      model["underscore_singular"] = name.camelize(:lower).pluralize(1).underscore
      model["dash_singular"] = name.camelize(:lower).pluralize(1).underscore.dasherize

      model["associations"] = model["associations"].map { |association|
        related = association["related"]
        association["pascal_singular"] = related.pluralize(1).camelize
        case association["type"]
        when "belongsTo"
          model["properties"].push({
            "name" => "#{association["pascal_singular"]}Id",
            "type" => "integer",
            "nullable" => false,
            "references" => {
                "model" => association["pascal"],
                "key" => "id",
            },
          })
        when "hasOne", "hasMany"
          modelIndexToUpdate = @model["models"].index{ | m | m["name"] == association["related"] }
          if !modelIndexToUpdate.nil?
            @model["models"][modelIndexToUpdate]["properties"].push({
              "name" => "#{model["pascal_singular"]}Id",
              "type" => "integer",
              "nullable" => false,
              "references" => {
                  "model" => model["pascal"],
                  "key" => "id",
              },
            })
          end
        end
        association
      }
      model
    }

    

    @model.to_json
  end

end