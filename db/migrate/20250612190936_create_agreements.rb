class CreateAgreements < ActiveRecord::Migration[8.0]
  def change
    create_table :agreements do |t|
      t.references :bank_connection, null: false, foreign_key: true
      t.string :agreement_id
      t.integer :max_historical_days
      t.integer :access_valid_for_days
      t.text :access_scope

      t.timestamps
    end
  end
end
