import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import { formatAmount, formatDate, transactionDisplayName } from '../lib/format'
import type { DashboardData } from '../lib/types'
import type { View } from '../components/SidebarNav'

interface DashboardPageProps {
  onNavigate?: (view: View) => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDashboard = async () => {
    setIsLoading(true)
    setError(false)
    try {
      const response = await api('/api/v1/dashboard')
      if (response.ok) setData(await response.json())
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-sm text-text-muted">{t('common.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="error-message flex items-center justify-between">
          <span>{t('common.load_error')}</span>
          <button className="btn-icon text-xs" onClick={fetchDashboard}>{t('common.retry')}</button>
        </div>
      </div>
    )
  }

  const hasData = data && data.transaction_count > 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Balance hero — the visual anchor */}
      <div className="card p-8 mb-8 row-enter">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-text-muted">
          {t('dashboard.total_balance')}
        </p>
        <p className="text-5xl md:text-6xl font-bold mono leading-none">
          {data ? formatAmount(data.total_balance) : '—'}
        </p>
      </div>

      {/* Stats strip — three numbers in a row */}
      <div className="card mb-8 grid grid-cols-1 md:grid-cols-3 row-enter" style={{ animationDelay: '0.05s' }}>
        <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-border">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
            {t('dashboard.income_this_month')}
          </p>
          <p className="text-2xl font-bold mono amount-positive">
            {data ? `+${formatAmount(data.income)}` : '—'}
          </p>
        </div>

        <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-border">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
            {t('dashboard.expenses_this_month')}
          </p>
          <p className="text-2xl font-bold mono">
            {data ? formatAmount(data.expenses) : '—'}
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
            {t('dashboard.transactions')}
          </p>
          <p className="text-2xl font-bold mono">
            {data?.transaction_count ?? 0}
          </p>
        </div>
      </div>

      {/* Recent transactions — ledger entries */}
      {hasData ? (
        <div className="card row-enter" style={{ animationDelay: '0.14s' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('dashboard.recent_title')}
            </p>
            <button
              onClick={() => onNavigate?.('transactions')}
              className="link text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              {t('dashboard.view_all')}
            </button>
          </div>
          {data!.recent_transactions.map((tx, i) => {
            const amt = parseFloat(tx.amount)
            return (
              <div
                key={tx.id}
                className="tx-row row-enter"
                style={{ animationDelay: `${0.16 + i * 0.03}s` }}
              >
                <div className="min-w-0 flex-1 mr-4">
                  <p className="font-medium text-sm truncate">
                    {transactionDisplayName(tx)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs mono text-text-muted">
                      {formatDate(tx.booking_date)}
                    </span>
                    {tx.category ? (
                      <span className="text-xs text-text-muted">
                        {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted italic">
                        {t('dashboard.uncategorized')}
                      </span>
                    )}
                  </div>
                </div>
                <p className={`mono font-semibold text-sm whitespace-nowrap ${amt >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                  {formatAmount(tx.amount, tx.currency)}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center row-enter" style={{ animationDelay: '0.14s' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <p className="text-lg font-medium mb-2">
            {t('dashboard.no_transactions')}
          </p>
          <p className="text-sm mb-6 text-text-muted">
            {t('dashboard.no_transactions_description')}
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate?.('settings')}>
            {t('dashboard.connect_bank')}
          </button>
        </div>
      )}
    </div>
  )
}
