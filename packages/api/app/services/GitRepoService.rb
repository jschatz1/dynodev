require "json"

class GitRepoService
  attr_reader :conn

  def initialize
    @conn = Faraday.new(
      url: 'https://gitlab.com/api/v4',
      headers: {
        'Content-Type' => 'application/json',
        'Authorization' => "Bearer #{ENV['GITLAB_ACCESS_TOKEN']}"
      }
    )
  end

  def createProject(name)
    conn.post('projects', {
      'visibility' => 'private'
    }) do |req|
      req.body = {name: name}.to_json
    end

  end
end
