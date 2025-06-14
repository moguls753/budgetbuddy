class CreateTransactionRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :transaction_records do |t|
      t.references :account, null: false, foreign_key: true
      t.string :transaction_id
      t.decimal :amount
      t.string :currency
      t.date :booking_date
      t.date :value_date
      t.text :remittance
      t.string :category

      t.timestamps
    end
  end
end
