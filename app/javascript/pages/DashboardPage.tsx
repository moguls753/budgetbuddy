import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Balance card */}
      <div className="card p-8 mb-8">
        <p className="text-sm font-medium mb-2 text-text-muted">
          {t('dashboard.total_balance')}
        </p>
        <p className="text-5xl font-bold mono">
          0,00 €
        </p>
        <p className="text-sm mt-2 text-text-muted">
          {t('dashboard.no_accounts')}
        </p>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm font-medium mb-1 text-text-muted">
            {t('dashboard.income_this_month')}
          </p>
          <p className="text-2xl font-bold mono text-accent">
            +0,00 €
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-medium mb-1 text-text-muted">
            {t('dashboard.expenses_this_month')}
          </p>
          <p className="text-2xl font-bold mono">
            −0,00 €
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-medium mb-1 text-text-muted">
            {t('dashboard.transactions')}
          </p>
          <p className="text-2xl font-bold mono">
            0
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="card p-12 text-center">
        <p className="text-lg font-medium mb-2">
          {t('dashboard.no_transactions')}
        </p>
        <p className="text-sm mb-6 text-text-muted">
          {t('dashboard.no_transactions_description')}
        </p>
        <button className="btn btn-primary">
          {t('dashboard.connect_bank')}
        </button>
      </div>
    </div>
  )
}
