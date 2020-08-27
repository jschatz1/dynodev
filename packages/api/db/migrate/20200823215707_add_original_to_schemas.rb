class AddOriginalToSchemas < ActiveRecord::Migration[6.0]
  def change
    add_column :schemas, :original, :string
  end
end
