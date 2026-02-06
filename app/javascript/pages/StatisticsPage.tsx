import { useTranslation } from 'react-i18next'

export default function StatisticsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('statistics.title')}</h2>
      <div className="card p-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <p className="text-lg font-medium mb-2">{t('statistics.empty_title')}</p>
        <p className="text-sm text-text-muted">
          {t('statistics.empty_description')}
        </p>
      </div>
    </div>
  )
}
