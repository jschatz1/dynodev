class Invite < ApplicationRecord
  before_create :attach_code

  def attach_code
    charset = %w{ 2 3 4 6 7 9 A C D E F G H J K M N P Q R T V W X Y Z}
    size = 9
    self.code = (0...size).map{ charset.to_a[rand(charset.size)] }.join
  end
end
