class CreateEnableBankingCredentials < ActiveRecord::Migration[8.1]
  def change
    create_table :enable_banking_credentials do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :app_id, null: false
      t.text :private_key_pem, null: false
      t.timestamps
    end
  end
end
