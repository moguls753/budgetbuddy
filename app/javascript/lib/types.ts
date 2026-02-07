export interface Category {
  id: number
  name: string
}

export interface DashboardTransaction {
  id: number
  amount: string
  currency: string
  booking_date: string
  remittance: string | null
  creditor_name: string | null
  debtor_name: string | null
  category: Category | null
}

export interface DashboardData {
  total_balance: string
  income: string
  expenses: string
  transaction_count: number
  recent_transactions: DashboardTransaction[]
}

export interface Transaction {
  id: number
  transaction_id: string
  amount: string
  currency: string
  booking_date: string
  value_date: string | null
  status: string
  remittance: string | null
  creditor_name: string | null
  creditor_iban: string | null
  debtor_name: string | null
  debtor_iban: string | null
  category: Category | null
  account_id: number
}

export interface PaginationMeta {
  page: number
  per: number
  total: number
  total_pages: number
}

export interface TransactionsResponse {
  transactions: Transaction[]
  meta: PaginationMeta
}

export interface BankConnectionSummary {
  id: number
  provider: string
  institution_name: string
}

export interface Account {
  id: number
  account_uid: string
  iban: string | null
  name: string
  currency: string
  balance_amount: string | null
  balance_type: string | null
  balance_updated_at: string | null
  last_synced_at: string | null
  bank_connection: BankConnectionSummary
}

export interface BankConnectionAccount {
  id: number
  iban: string | null
  name: string
  currency: string
  balance_amount: string | null
}

export interface BankConnection {
  id: number
  provider: string
  institution_id: string
  institution_name: string
  country_code: string
  status: string
  valid_until: string | null
  last_synced_at: string | null
  error_message: string | null
  accounts: BankConnectionAccount[]
}

export interface CredentialsStatus {
  enable_banking: { configured: boolean; app_id?: string }
  gocardless: { configured: boolean }
}
