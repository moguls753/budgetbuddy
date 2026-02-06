class CreateAccounts < ActiveRecord::Migration[8.1]
  def change
    create_table :accounts do |t|
      t.references :bank_connection, null: false, foreign_key: true
      t.string :account_uid, null: false
      t.string :identification_hash
      t.string :iban
      t.string :name
      t.string :currency, limit: 3, default: "EUR"
      t.string :account_type
      t.decimal :balance_amount, precision: 15, scale: 2
      t.string :balance_type
      t.datetime :balance_updated_at
      t.datetime :last_synced_at
      t.timestamps
    end

    add_index :accounts, :account_uid
    add_index :accounts, :identification_hash
  end
end
