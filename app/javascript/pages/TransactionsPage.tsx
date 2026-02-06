import { useTranslation } from 'react-i18next'

export default function TransactionsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('transactions.title')}</h2>
      <div className="card p-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        <p className="text-lg font-medium mb-2">{t('transactions.empty_title')}</p>
        <p className="text-sm text-text-muted">
          {t('transactions.empty_description')}
        </p>
      </div>
    </div>
  )
}
