require "uuidtools"
require 'jwt'
require "pp"

class Api::V1::CliController < ApplicationController
  before_action :authorize_cli, only: [
    :cli_say_hello,
    :create_oauth2_client,
    :cli_auth_initialized,
    :get_routes
  ]

  def auth
    uuid = UUIDTools::UUID.random_create.to_s
    secret = ENV["SECRET_KEY"]
    payload = { data: uuid }

    render json: {
      browser_url: "/api/v1/cli/auth/browser/#{uuid}",
      cli_url: "/api/v1/cli/auth",
      token: JWT.encode(payload, secret, 'HS256')
    }
  end

  def browser_auth
    payload = {data: params[:uuid], from: "cli"}
    secret = ENV["SECRET_KEY"]
    token = JWT.encode(payload, secret, 'HS256')
    redirect_to "/auth/github?state=#{token}"
  end

  def cli_auth_from_token
    secret = ENV["SECRET_KEY"]
    begin
      decoded_token = JWT.decode bearer_token, secret, true, { algorithm: 'HS256' }
      key = decoded_data(decoded_token, "data")
      user_key = Key.find_by(uuid: key)
      user_key.uuid = ""
      user_key.save!
      json_response({msg: "Login to CLI Successful", token: user_key.access})
    rescue Exception => e
      json_response({msg: "Invalid token"}, :bad_request)
    end
  end

  def create_oauth2_client
    client_id = cli_params[:client_id]
    client_secret = cli_params[:client_secret]
    @project = Project.find_by(uuid: params[:project_id])
    schema_name = "#{@current_user.name}_#{@project.name}"
    table_name = "oauth_clients"
    existing_client_id_sql = <<-EXISTINGCLIENTIDSQL
      SELECT COUNT(*) FROM "#{schema_name}"."#{table_name}" WHERE "client_id" = '#{client_id}';
    EXISTINGCLIENTIDSQL
    existing_client_id_execution = ActiveRecord::Base.connection.execute(existing_client_id_sql)
    if existing_client_id_execution.values[0][0] == 0
      sql = <<-INSERTSQL
        INSERT INTO "#{schema_name}"."#{table_name}"
        (client_id, client_secret, redirect_uri, created_at, updated_at)
        VALUES
        ('#{client_id}', '#{client_secret}', 'https://localhost:3000', NOW(), NOW());
      INSERTSQL
      execution = ActiveRecord::Base.connection.execute(sql);
    end
    json_response({msg: "Saved!"})
  end

  def cli_auth_initialized
    @project = Project.find_by(uuid: params[:project_id])
    schema_name = "#{@current_user.name}_#{@project.name}"
    check_if_table_exists_sql = <<-DOESTABLEEXIST
    SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE  table_schema = '#{schema_name}'
     AND    table_name   = 'oauth_clients'
    );
    DOESTABLEEXIST
    execution = ActiveRecord::Base.connection.execute(check_if_table_exists_sql);
    exists = execution.values[0][0]
    if exists
      check_if_client_id_exists_sql = <<-DOESCLIENTIDEXIST
        SELECT COUNT(*) FROM #{schema_name}.oauth_clients LIMIT 1;
      DOESCLIENTIDEXIST
      execution = ActiveRecord::Base.connection.execute(check_if_client_id_exists_sql);
      exists = execution.values[0][0]
    end
    callback_root = ENV["RAILS_ENV"] === "production" ? "https://dyno.dev" : "http://localhost:3001"
    callbackURL = "#{callback_root}/api/v1/#{@current_user.name}/#{@project.name}/auth/github/callback"
    json_response({exists: exists, callback_url: callbackURL})
  end

  def get_routes
    @project = Project.find_by(uuid: params[:project_id])
    schema_name = "#{@current_user.name}_#{@project.name}"
    list_of_tables = <<-LISTOFTABLES
    SELECT "table_name" FROM information_schema.tables
    WHERE table_schema = '#{schema_name}'
    LISTOFTABLES
    execution = ActiveRecord::Base.connection.execute(list_of_tables)
    tables_filtered = execution.values.flatten - ['users', 'oauth_tokens', 'oauth_clients', 'authorized_routes', 'scoped_routes', 'associations', 'selections']
    tables_with_hashes = tables_filtered.map { |table|
      list_of_columns = <<-LISTOFCOLUMNS
      SELECT column_name,data_type 
      FROM information_schema.columns 
      where table_schema = '#{schema_name}'
      AND table_name = '#{table}';
      LISTOFCOLUMNS
      execution = ActiveRecord::Base.connection.execute(list_of_columns)
      properties = execution.values.map { |v| {name: v[0], type: v[1]  }} - ['id']
      {
        name: table,
        properties: properties,
        urls: [
          {
            method: "GET",
            url: "/api/v1/#{@current_user.name}/#{@project.name}/#{table}",
            verb: "index"
          },
          {
            method: "POST",
            url: "/api/v1/#{@current_user.name}/#{@project.name}/#{table}",
            verb: "create"
          },
          {
            method: "GET",
            url: "/api/v1/#{@current_user.name}/#{@project.name}/#{table}/:id",
            verb: "read"
          },
          {
            method: "PUT",
            url: "/api/v1/#{@current_user.name}/#{@project.name}/#{table}/:id",
            verb: "update"
          },
          {
            method: "DELETE",
            url: "/api/v1/#{@current_user.name}/#{@project.name}/#{table}/:id",
            verb: "destroy"
          }
        ]
      }
    }
    json_response({tables: tables_with_hashes})
  end

  def cli_say_hello
    json_response({msg: "Hey #{@current_user.name}!
  This is the server, speaking to you from another dimension.
  Looks like everything is working!
  You can create a project, or add almond to your existing backend with `almond init`!
  Try it today!
  Navigate to one of your frontend projects and run `almond init`"});
  end

private
  def bearer_token
    pattern = /^Bearer /
    header  = request.headers['Authorization']
    header.gsub(pattern, '') if header && header.match(pattern)
  end

  def cli_params
    params.require(:cli).permit(:client_id, :client_secret)
  end

end
