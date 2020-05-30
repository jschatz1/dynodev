class User < ApplicationRecord
  before_create :save_secret_key
  has_one :key, dependent: :destroy
  has_many :projects

  def self.find_or_create_from_auth_hash(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.email = auth.info.email
      user.name = auth.info.nickname
    end
  end
end
