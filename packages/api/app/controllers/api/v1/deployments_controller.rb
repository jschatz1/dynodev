class Api::V1::DeploymentsController < ApplicationController
  def create
    json_response({msg: "Creating token"}, :bad_request)
  end
end