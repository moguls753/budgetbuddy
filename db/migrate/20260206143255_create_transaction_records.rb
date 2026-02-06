class CreateTransactionRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :transaction_records do |t|
      t.references :account, null: false, foreign_key: true
      t.references :category, foreign_key: true
      t.string :transaction_id, null: false
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :currency, limit: 3, null: false
      t.date :booking_date, null: false
      t.date :value_date
      t.string :status, default: "booked"
      t.text :remittance
      t.string :creditor_name
      t.string :creditor_iban
      t.string :debtor_name
      t.string :debtor_iban
      t.string :bank_transaction_code
      t.string :entry_reference
      t.timestamps
    end

    add_index :transaction_records, [ :account_id, :transaction_id ], unique: true
    add_index :transaction_records, :booking_date
  end
end
