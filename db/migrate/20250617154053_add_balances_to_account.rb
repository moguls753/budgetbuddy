class AddBalancesToAccount < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :interim_available, :decimal
    add_column :accounts, :interim_booked, :decimal
    add_column :accounts, :closing_booked, :decimal
  end
end
