class CreateLlmCredentials < ActiveRecord::Migration[8.1]
  def change
    create_table :llm_credentials do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :base_url, null: false
      t.text :api_key
      t.string :llm_model, null: false
      t.timestamps
    end
  end
end
