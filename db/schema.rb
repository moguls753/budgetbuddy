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

ActiveRecord::Schema[8.1].define(version: 2026_02_06_143255) do
  create_table "accounts", force: :cascade do |t|
    t.string "account_type"
    t.string "account_uid", null: false
    t.decimal "balance_amount", precision: 15, scale: 2
    t.string "balance_type"
    t.datetime "balance_updated_at"
    t.integer "bank_connection_id", null: false
    t.datetime "created_at", null: false
    t.string "currency", limit: 3, default: "EUR"
    t.string "iban"
    t.string "identification_hash"
    t.datetime "last_synced_at"
    t.string "name"
    t.datetime "updated_at", null: false
    t.index ["account_uid"], name: "index_accounts_on_account_uid"
    t.index ["bank_connection_id"], name: "index_accounts_on_bank_connection_id"
    t.index ["identification_hash"], name: "index_accounts_on_identification_hash"
  end

  create_table "bank_connections", force: :cascade do |t|
    t.string "authorization_id"
    t.string "country_code", limit: 2
    t.datetime "created_at", null: false
    t.text "error_message"
    t.string "institution_id", null: false
    t.string "institution_name"
    t.datetime "last_synced_at"
    t.string "session_id"
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.datetime "valid_until"
    t.index ["session_id"], name: "index_bank_connections_on_session_id", unique: true
    t.index ["user_id", "institution_id"], name: "index_bank_connections_on_user_id_and_institution_id"
    t.index ["user_id"], name: "index_bank_connections_on_user_id"
  end

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id", "name"], name: "index_categories_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_categories_on_user_id"
  end

  create_table "enable_banking_credentials", force: :cascade do |t|
    t.string "app_id", null: false
    t.datetime "created_at", null: false
    t.text "private_key_pem", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_enable_banking_credentials_on_user_id", unique: true
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "transaction_records", force: :cascade do |t|
    t.integer "account_id", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.string "bank_transaction_code"
    t.date "booking_date", null: false
    t.integer "category_id"
    t.datetime "created_at", null: false
    t.string "creditor_iban"
    t.string "creditor_name"
    t.string "currency", limit: 3, null: false
    t.string "debtor_iban"
    t.string "debtor_name"
    t.string "entry_reference"
    t.text "remittance"
    t.string "status", default: "booked"
    t.string "transaction_id", null: false
    t.datetime "updated_at", null: false
    t.date "value_date"
    t.index ["account_id", "transaction_id"], name: "index_transaction_records_on_account_id_and_transaction_id", unique: true
    t.index ["account_id"], name: "index_transaction_records_on_account_id"
    t.index ["booking_date"], name: "index_transaction_records_on_booking_date"
    t.index ["category_id"], name: "index_transaction_records_on_category_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "accounts", "bank_connections"
  add_foreign_key "bank_connections", "users"
  add_foreign_key "categories", "users"
  add_foreign_key "enable_banking_credentials", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "transaction_records", "accounts"
  add_foreign_key "transaction_records", "categories"
end
