class CreateKeys < ActiveRecord::Migration[6.0]
  def change
    create_table :keys do |t|
      t.belongs_to :user
      t.string :uuid
      t.string :access

      t.timestamps
    end
  end
end
