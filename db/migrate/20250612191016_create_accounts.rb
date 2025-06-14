class CreateAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :accounts do |t|
      t.references :bank_connection, null: false, foreign_key: true
      t.string :account_id
      t.string :iban
      t.string :name
      t.string :currency
      t.string :status

      t.timestamps
    end
  end
end
