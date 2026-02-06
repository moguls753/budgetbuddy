class CreateGoCardlessCredentials < ActiveRecord::Migration[8.1]
  def change
    create_table :go_cardless_credentials do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :secret_id, null: false
      t.string :secret_key, null: false
      t.text :access_token
      t.text :refresh_token
      t.datetime :access_expires_at
      t.datetime :refresh_expires_at
      t.timestamps
    end
  end
end
