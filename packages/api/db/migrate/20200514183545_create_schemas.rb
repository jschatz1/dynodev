class CreateSchemas < ActiveRecord::Migration[6.0]
  def change
    create_table :schemas do |t|
      t.belongs_to :project
      t.text :contents

      t.timestamps
    end
  end
end
