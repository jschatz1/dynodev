class User < ApplicationRecord
  has_one :key, dependent: :destroy
  has_many :projects
  has_many :invites

  after_create :createInvites, :updateUserUninvited

  def self.find_or_create_from_auth_hash(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.email = auth.info.email
      user.name = auth.info.nickname
    end
  end

  def updateUserInvited 
    updated = self.update(accepted: true)
  end

  private
    def updateUserUninvited
      self.accepted = false
    end

    def createInvites
      # save 2 invite codes per user
      invite1 = Invite.new
      invite1.user_id = self.id
      invite1.save!
      invite2 = Invite.new
      invite2.user_id = self.id
      invite2.save!
    end
end
