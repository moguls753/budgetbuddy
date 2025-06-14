class CreateGoCardlessTokens < ActiveRecord::Migration[8.0]
  def change
    create_table :go_cardless_tokens do |t|
      t.string :access_token
      t.string :refresh_token
      t.datetime :expires_at

      t.timestamps
    end
  end
end
