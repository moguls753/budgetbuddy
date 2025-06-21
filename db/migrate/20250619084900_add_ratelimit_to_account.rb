class AddRatelimitToAccount < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :account_ratelimit, :integer
    add_column :accounts, :balances_ratelimit, :integer
    add_column :accounts, :details_ratelimit, :integer
    add_column :accounts, :transactions_ratelimit, :integer

    add_column :accounts, :account_ratelimit_reset, :integer
    add_column :accounts, :balances_ratelimit_reset, :integer
    add_column :accounts, :details_ratelimit_reset, :integer
    add_column :accounts, :transactions_ratelimit_reset, :integer

    add_column :accounts, :account_ratelimit_remaining, :integer
    add_column :accounts, :balances_ratelimit_remaining, :integer
    add_column :accounts, :details_ratelimit_remaining, :integer
    add_column :accounts, :transactions_ratelimit_remaining, :integer
  end
end
