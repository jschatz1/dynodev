class CreateProjects < ActiveRecord::Migration[6.0]
  def change
    create_table :projects do |t|
      t.belongs_to :user
      t.string :name
      t.text :description
      t.string :uuid

      t.timestamps
    end
    add_index :projects, [:uuid], unique: true
    add_index :projects, [:name], unique: true
  end
end
