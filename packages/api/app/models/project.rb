require "uuidtools"

class Project < ApplicationRecord
  has_many :schemas
  before_create :attach_uuid

  def attach_uuid
    self.uuid = UUIDTools::UUID.random_create.to_s
  end

end
