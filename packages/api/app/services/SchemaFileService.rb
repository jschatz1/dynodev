require "json"
require "pp"

module ColumnTypes
  STRING = "string"
  EMAIL = "email"
  INTEGER = "integer"
  BOOLEAN = "boolean"
  DATE = "date"
  SERIAL = "bigserial"
end

class SchemaFileService

  def initialize(contents)
    @contents = contents
    @model = nil
  end

  def migrate(schema)
    sql = Array.new
    add_authorize_table(schema)
    add_scope_table(schema)
    add_associations_table(schema)
    add_selections_table(schema)
    @model["models"].each { |model|
      if model["properties"].nil?
        model["properties"] = Array.new
      end

      model["properties"].unshift(
        {"name" => "id",
          "type" => "bigserial",
          "unique" => false,
          "nullable" => false,
          "primary" => true
        })

      model["properties"].push(
        {"name" => "created_at",
          "type" => "date",
          "unique" => false,
          "nullable" => false
        })

      model["properties"].push(
        {"name" => "updated_at",
          "type" => "date",
          "unique" => false,
          "nullable" => false
        })
      drop_table_sql = <<-DROP_TABLE_SQL
      DROP TABLE IF EXISTS "#{schema}"."#{model["underscore"]}";
      DROP_TABLE_SQL
      if model["name"] == "oauth_clients" || model["name"] == "oauth_tokens"
        drop_table_sql = ""
        create_table_if_not_exists_sql = <<-CREATE_TABLE_IF_NOT_EXISTS_SQL
        CREATE TABLE IF NOT EXISTS "#{schema}"."#{model["underscore"]}"
        CREATE_TABLE_IF_NOT_EXISTS_SQL
      else
        create_table_if_not_exists_sql = <<-CREATE_TABLE_IF_NOT_EXISTS_SQL
        CREATE TABLE "#{schema}"."#{model["underscore"]}"
        CREATE_TABLE_IF_NOT_EXISTS_SQL
      end
      create_table_sql = <<-CREATE_TABLE_SQL
      #{drop_table_sql}
      #{create_table_if_not_exists_sql}
      (
        #{table_properties(model["properties"])}
      )
      WITH (
        OIDS = FALSE
      );
      ALTER TABLE "#{schema}"."#{model["underscore"]}" OWNER to jacobschatz;
      CREATE_TABLE_SQL

      sql.push(create_table_sql)
      migrate_authorized_actions(schema, model)
      migrate_scoped_routes(schema, model)
      migrate_associations(schema, model)
      migrate_selections(schema, model)
    }
    execution = ActiveRecord::Base.connection.execute(sql.join("\n"))
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

    has_auth_index = @model["models"].index { |model|
      model.has_key?("auth") && model["auth"] == true
    }

    if !has_auth_index.nil?
      user_model = @model["models"][has_auth_index]
      @model["models"].delete_at(has_auth_index)
      @model["models"] = auth_hashes(user_model) + @model["models"]
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
        association["underscore"] = related.camelize(:lower).pluralize(2).underscore
        case association["type"]
        when "belongsTo"
          model["properties"].push({
            "name" => "#{association["underscore_singular"]}_id",
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
              "name" => "#{model["underscore_singular"]}_id",
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

  private

  def add_selections_table(schema)
    create_select_sql = <<-CREATE_TABLE_SQL
      DROP TABLE IF EXISTS "#{schema}"."selections";
      CREATE TABLE "#{schema}"."selections"
      (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        model VARCHAR(256) NOT NULL,
        selections VARCHAR(256) NOT NULL
      )
      WITH (
        OIDS = FALSE
      );
      ALTER TABLE "#{schema}"."selections" OWNER to jacobschatz;
      CREATE_TABLE_SQL
    execution = ActiveRecord::Base.connection.execute(create_select_sql)
  end

  def migrate_selections(schema, model)
    if model.key?("selectables")

      values = "('#{model["underscore"]}', '#{model["selectables"].flatten.to_json}')"
      insert_selection_sql = <<-INSERT_TABLE_SQL
      INSERT INTO "#{schema}"."selections" (model, selections)
      VALUES #{values};
      INSERT_TABLE_SQL
      execution = ActiveRecord::Base.connection.execute(insert_selection_sql)
    end
  end

  def add_associations_table(schema)
    create_associations_sql = <<-CREATE_TABLE_SQL
      DROP TABLE IF EXISTS "#{schema}"."associations";
      CREATE TABLE "#{schema}"."associations"
      (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        model VARCHAR(256) NOT NULL,
        related VARCHAR(256) NOT NULL,
        type VARCHAR(256) NOT NULL,
        model_key VARCHAR(256) NOT NULL
      )
      WITH (
        OIDS = FALSE
      );
      ALTER TABLE "#{schema}"."associations" OWNER to jacobschatz;
      CREATE_TABLE_SQL
    execution = ActiveRecord::Base.connection.execute(create_associations_sql)
  end

  def migrate_associations(schema, model)
    if model.key?("associations")
      add_associations = Array.new
      model["associations"].each{ |association|
        if association.has_key?("related") && association.has_key?("type")
          # model, related, type
          add_associations.push("('#{model["underscore"]}', '#{association["underscore"]}', '#{association["type"]}', '#{model["underscore_singular"]}_id')")
        end
      }
      if add_associations.count > 0
        insert_association_sql = <<-INSERT_TABLE_SQL
        INSERT INTO "#{schema}"."associations" (model, related, type, model_key)
        VALUES #{add_associations.join(",")};
        INSERT_TABLE_SQL
        execution = ActiveRecord::Base.connection.execute(insert_association_sql)
      end
    end
  end

  def add_scope_table(schema)
    create_scope_sql = <<-CREATE_TABLE_SQL
      DROP TABLE IF EXISTS "#{schema}"."scoped_routes";
      CREATE TABLE "#{schema}"."scoped_routes"
      (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        model VARCHAR(256) NOT NULL,
        action VARCHAR(256) NOT NULL,
        scope VARCHAR(256) NOT NULL
      )
      WITH (
        OIDS = FALSE
      );
      ALTER TABLE "#{schema}"."scoped_routes" OWNER to jacobschatz;
      CREATE_TABLE_SQL
    execution = ActiveRecord::Base.connection.execute(create_scope_sql)
  end

  def migrate_scoped_routes(schema, model)
    if model.key?("scope")
      approved_actions = ["index", "create", "read", "update", "destroy"]
      approved_scopes = ["user", "all", "none"]
      add_scope_actions = Array.new
      model["scope"].each{ |action, value|
        if approved_scopes.include?(value) && approved_actions.include?(action)
          # table, action, scope
          add_scope_actions.push("('#{model["underscore"]}', '#{action}', '#{value}')")
        end
      }
      if add_scope_actions.count > 0
        insert_scope_sql = <<-INSERT_TABLE_SQL
        INSERT INTO "#{schema}"."scoped_routes" (model, action, scope)
        VALUES #{add_scope_actions.join(",")};
        INSERT_TABLE_SQL
        execution = ActiveRecord::Base.connection.execute(insert_scope_sql)
      end
    end
  end

  def add_authorize_table(schema)
    create_table_sql = <<-CREATE_TABLE_SQL
      DROP TABLE IF EXISTS "#{schema}"."authorized_routes";
      CREATE TABLE "#{schema}"."authorized_routes"
      (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        model VARCHAR(256) NOT NULL,
        action VARCHAR(256) NOT NULL
      )
      WITH (
        OIDS = FALSE
      );
      ALTER TABLE "#{schema}"."authorized_routes" OWNER to jacobschatz;
      CREATE_TABLE_SQL
    execution = ActiveRecord::Base.connection.execute(create_table_sql)
  end

  def migrate_authorized_actions(schema, model)
    if model.key?("authorize")
      approved_actions = ["index", "create", "read", "update", "destroy"]
      add_auth_actions = Array.new
      model["authorize"].each{ |action|
        if approved_actions.include? action
          # table, action
          # having an action means it should be authorized
          add_auth_actions.push("('#{model["underscore"]}', '#{action}')")
        end
      }
      if add_auth_actions.count > 0
        insert_auth_sql = <<-INSERT_TABLE_SQL
        INSERT INTO "#{schema}"."authorized_routes" (model, action)
        VALUES #{add_auth_actions.join(",")};
        INSERT_TABLE_SQL
        execution = ActiveRecord::Base.connection.execute(insert_auth_sql)
      end
    end
  end

  def table_properties(properties)
    properties.map { |property|
      property_definition = [property["name"]]
      
      case property["type"]
      when ColumnTypes::STRING
        property_definition.push("VARCHAR(256)")
      when ColumnTypes::EMAIL
        property_definition.push("VARCHAR(256)")
      when ColumnTypes::INTEGER
        property_definition.push("BIGINT")
      when ColumnTypes::BOOLEAN
        property_definition.push("BOOLEAN")
      when ColumnTypes::DATE
        property_definition.push("TIMESTAMP")
      when ColumnTypes::SERIAL
        property_definition.push("BIGSERIAL")
      end
      
      if not property["nullable"]
        property_definition.push("NOT NULL")
      end

      if property["primary"]
        property_definition.push("PRIMARY KEY")
      end

      if property["unique"]
        property_definition.push("UNIQUE")
      end

      property_definition.join(" ")
    }.join(", ")
  end

  def auth_hashes(user_model)
    [{
      "name"=>"user",
      "properties"=>[
        {
          "name"=>"username",
          "type"=>"string",
          "unique"=>true,
          "nullable"=>false
        },
        {
          "name"=>"email",
          "type"=>"email",
          "unique"=>true,
          "nullable"=>true
        },
        {
          "name"=>"profile_pic",
          "type"=>"string",
          "unique"=>false,
          "nullable"=>true
        },
        {
          "name"=>"family_name",
          "type"=>"string",
          "unique"=>false,
          "nullable"=>true
        },
        {
          "name"=>"given_name",
          "type"=>"string",
          "unique"=>false,
          "nullable"=>true
        },
        {
          "name"=>"uid",
          "type"=>"string",
          "unique"=>false,
          "nullable"=>false
        }
      ],
      "associations"=> user_model.nil? ? [] : user_model["associations"],
      "authorize" => user_model.nil? ? [] : user_model["authorize"],
      "scope" => user_model.nil? ? [] : user_model["scope"],
      "selectables" => ["id", "username", "email", "profile_pic", "family_name", "given_name", "created_at", "updated_at"]
    },
    {
      "name"=>"oauth_tokens",
      "properties"=>[
        {
          "name"=>"access_token",
          "type"=>"string",
          "nullable"=>false,
          "unique"=>false
        },
        {
          "name"=>"access_token_expires_on",
          "type"=>"date",
          "nullable"=>false
        },
        {
          "name"=>"client_id",
          "type"=>"string",
          "nullable"=>false
        },
        {
          "name"=>"refresh_token",
          "type"=>"string",
          "nullable"=>false
        },
        {
          "name"=>"refresh_token_expires_on",
          "type"=>"date",
          "nullable"=>false
        },
        {
          "name"=>"user_id",
          "type"=>"integer",
          "nullable"=>false
        }
      ],
      "associations"=>[]
    },
    {
      "name"=>"oauth_clients",
      "properties"=>[
        {
          "name"=>"client_id",
          "type"=>"string",
          "nullable"=>false
        },
        {
          "name"=>"client_secret",
          "type"=>"string",
          "nullable"=>false
        },
        {
          "name"=>"redirect_uri",
          "type"=>"string",
          "nullable"=>false
        }
      ],
      "associations"=>[]
    }]
  end

end