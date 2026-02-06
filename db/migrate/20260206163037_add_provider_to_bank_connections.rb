class AddProviderToBankConnections < ActiveRecord::Migration[8.1]
  def change
    add_column :bank_connections, :provider, :string, null: false, default: "enable_banking"
    add_column :bank_connections, :requisition_id, :string
    add_column :bank_connections, :link, :string
  end
end
