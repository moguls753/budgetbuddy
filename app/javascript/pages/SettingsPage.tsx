import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('settings.title')}</h2>
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-2">{t('settings.language')}</h3>
        <p className="text-sm text-text-muted mb-4">{t('settings.language_description')}</p>
        <LanguageSwitcher />
      </div>
    </div>
  )
}
