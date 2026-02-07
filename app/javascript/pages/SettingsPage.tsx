import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import LanguageSwitcher from '../components/LanguageSwitcher'
import CredentialForm from '../components/CredentialForm'
import ConnectBankFlow from '../components/ConnectBankFlow'
import type { CredentialsStatus } from '../lib/types'

export default function SettingsPage() {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState<CredentialsStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)

  const fetchCredentials = () => {
    api('/api/v1/credentials')
      .then(async r => { if (r.ok) setCredentials(await r.json()) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchCredentials() }, [])

  const toggleProvider = (p: string) => {
    setExpandedProvider(prev => prev === p ? null : p)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('settings.title')}</h2>

      {/* Language */}
      <div className="card p-6 mb-4 row-enter">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
          {t('settings.language')}
        </h3>
        <p className="text-sm text-text-muted mb-4">{t('settings.language_description')}</p>
        <LanguageSwitcher />
      </div>

      {/* Credentials */}
      <div className="card mb-4 row-enter" style={{ animationDelay: '0.05s' }}>
        <div className="px-4 py-3 border-b-2 border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t('settings.credentials')}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">{t('settings.credentials_description')}</p>
        </div>

        {isLoading ? (
          <div className="p-4 text-sm text-text-muted">{t('common.loading')}</div>
        ) : credentials && (
          <>
            {/* Enable Banking */}
            <div className="px-4 py-3 border-b-2 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{t('settings.enable_banking')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('settings.enable_banking_description')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`badge ${credentials.enable_banking.configured ? 'badge-accent' : 'badge-muted'}`}>
                    {credentials.enable_banking.configured ? t('settings.configured') : t('settings.not_configured')}
                  </span>
                  <button
                    className="btn-icon text-xs"
                    onClick={() => toggleProvider('enable_banking')}
                  >
                    {credentials.enable_banking.configured ? t('settings.update_credentials') : t('settings.configure')}
                  </button>
                </div>
              </div>
              {expandedProvider === 'enable_banking' && (
                <CredentialForm
                  provider="enable_banking"
                  isConfigured={credentials.enable_banking.configured}
                  onSaved={() => { fetchCredentials(); setExpandedProvider(null) }}
                />
              )}
            </div>

            {/* GoCardless */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{t('settings.gocardless')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t('settings.gocardless_description')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`badge ${credentials.gocardless.configured ? 'badge-accent' : 'badge-muted'}`}>
                    {credentials.gocardless.configured ? t('settings.configured') : t('settings.not_configured')}
                  </span>
                  <button
                    className="btn-icon text-xs"
                    onClick={() => toggleProvider('gocardless')}
                  >
                    {credentials.gocardless.configured ? t('settings.update_credentials') : t('settings.configure')}
                  </button>
                </div>
              </div>
              {expandedProvider === 'gocardless' && (
                <CredentialForm
                  provider="gocardless"
                  isConfigured={credentials.gocardless.configured}
                  onSaved={() => { fetchCredentials(); setExpandedProvider(null) }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Connect Bank */}
      <div className="card p-6 row-enter" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
          {t('settings.connect_bank')}
        </h3>
        <p className="text-xs text-text-muted mb-4">{t('settings.connect_bank_description')}</p>
        {credentials && <ConnectBankFlow credentials={credentials} />}
      </div>
    </div>
  )
}
