class AddPsd2FieldsToTransactionRecords < ActiveRecord::Migration[8.0]
  def change
    add_column :transaction_records, :mandate_id, :string
    add_column :transaction_records, :creditor_id, :string
    add_column :transaction_records, :creditor_name, :string
    add_column :transaction_records, :creditor_iban, :string
    add_column :transaction_records, :debtor_name, :string
    add_column :transaction_records, :debtor_iban, :string
    add_column :transaction_records, :bank_transaction_code, :string
  end
end
