class CreateInvites < ActiveRecord::Migration[6.0]
  def change
    create_table :invites do |t|
      t.belongs_to :user
      t.string :code

      t.timestamps
    end
  end
end
