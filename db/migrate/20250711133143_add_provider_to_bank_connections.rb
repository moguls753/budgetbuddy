class AddProviderToBankConnections < ActiveRecord::Migration[8.0]
  def change
    add_column :bank_connections, :credentials_encrypted, :text
    add_column :bank_connections, :last_scraped_at, :datetime
    add_column :bank_connections, :scraper_config, :text
  end
end
