import { useTranslation } from 'react-i18next'

export default function CategoriesPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('categories.title')}</h2>
      <div className="card p-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <p className="text-lg font-medium mb-2">{t('categories.empty_title')}</p>
        <p className="text-sm text-text-muted">
          {t('categories.empty_description')}
        </p>
      </div>
    </div>
  )
}
