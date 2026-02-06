class CreateBankConnections < ActiveRecord::Migration[8.1]
  def change
    create_table :bank_connections do |t|
      t.references :user, null: false, foreign_key: true
      t.string :institution_id, null: false
      t.string :institution_name
      t.string :country_code, limit: 2
      t.string :authorization_id
      t.string :session_id
      t.string :status, null: false, default: "pending"
      t.datetime :valid_until
      t.datetime :last_synced_at
      t.text :error_message
      t.timestamps
    end

    add_index :bank_connections, [ :user_id, :institution_id ]
    add_index :bank_connections, :session_id, unique: true
  end
end
