require 'jwt'

module Tokens
  def decoded_data(data, prop)
    index = data.index {|x| x.has_key? prop}
    if index.nil?
      index
    else
      data[index][prop]
    end
  end

  def http_token
    @http_token ||= request.headers['Authorization'].present?
    request.headers['Authorization'].split(' ').last
  end

  def auth_token
    secret = ENV['SECRET_KEY']
    @auth_token ||= JWT.decode http_token, secret, true, { algorithm: 'HS256' }
  end

  def user_id_in_token?
    http_token && auth_token && auth_token[:user_id].to_i
  end
end