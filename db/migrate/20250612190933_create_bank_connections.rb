class CreateBankConnections < ActiveRecord::Migration[8.0]
  def change
    create_table :bank_connections do |t|
      t.references :user, null: false, foreign_key: true
      t.string :institution_id
      t.string :requisition_id
      t.string :link
      t.string :status

      t.timestamps
    end
  end
end
