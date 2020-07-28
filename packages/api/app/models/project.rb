require "uuidtools"

class Project < ApplicationRecord
  has_many :schemas
  thread_mattr_accessor :current_user
  before_create :attach_uuid

  def attach_uuid
    self.uuid = UUIDTools::UUID.random_create.to_s
  end

end
