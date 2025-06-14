class RenameExpiresAtAndAddRefreshExpiresToGoCardlessTokens < ActiveRecord::Migration[8.0]
  def change
    rename_column :go_cardless_tokens, :expires_at, :access_expires

    change_column :go_cardless_tokens, :access_expires, :integer, null: false, default: 0

    add_column :go_cardless_tokens, :refresh_expires, :integer, null: false, default: 0
  end
end
