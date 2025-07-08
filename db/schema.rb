# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_07_08_200047) do
  create_table "accounts", force: :cascade do |t|
    t.integer "bank_connection_id", null: false
    t.string "account_id"
    t.string "iban"
    t.string "name"
    t.string "currency"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "interim_available"
    t.decimal "interim_booked"
    t.decimal "closing_booked"
    t.integer "account_ratelimit"
    t.integer "balances_ratelimit"
    t.integer "details_ratelimit"
    t.integer "transactions_ratelimit"
    t.integer "account_ratelimit_reset"
    t.integer "balances_ratelimit_reset"
    t.integer "details_ratelimit_reset"
    t.integer "transactions_ratelimit_reset"
    t.integer "account_ratelimit_remaining"
    t.integer "balances_ratelimit_remaining"
    t.integer "details_ratelimit_remaining"
    t.integer "transactions_ratelimit_remaining"
    t.index ["bank_connection_id"], name: "index_accounts_on_bank_connection_id"
  end

  create_table "agreements", force: :cascade do |t|
    t.integer "bank_connection_id", null: false
    t.string "agreement_id"
    t.integer "max_historical_days"
    t.integer "access_valid_for_days"
    t.text "access_scope"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bank_connection_id"], name: "index_agreements_on_bank_connection_id"
  end

  create_table "bank_connections", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "institution_id"
    t.string "requisition_id"
    t.string "link"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_bank_connections_on_user_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_categories_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_categories_on_user_id"
  end

  create_table "go_cardless_tokens", force: :cascade do |t|
    t.string "access_token"
    t.string "refresh_token"
    t.integer "access_expires", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "refresh_expires", default: 0, null: false
  end

  create_table "sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "transaction_records", force: :cascade do |t|
    t.integer "account_id", null: false
    t.string "transaction_id"
    t.decimal "amount"
    t.string "currency"
    t.date "booking_date"
    t.date "value_date"
    t.text "remittance"
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "mandate_id"
    t.string "creditor_id"
    t.string "creditor_name"
    t.string "creditor_iban"
    t.string "debtor_name"
    t.string "debtor_iban"
    t.string "bank_transaction_code"
    t.index ["account_id"], name: "index_transaction_records_on_account_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "accounts", "bank_connections"
  add_foreign_key "agreements", "bank_connections"
  add_foreign_key "bank_connections", "users"
  add_foreign_key "categories", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "transaction_records", "accounts"
end
