class CreateProjects < ActiveRecord::Migration[6.0]
  def change
    create_table :projects do |t|
      t.string :name
      t.text :description
      t.string :uuid

      t.timestamps
    end
    add_index :projects, [:uuid], unique: true
  end
end
