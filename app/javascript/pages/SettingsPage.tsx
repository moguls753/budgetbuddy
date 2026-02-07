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
  const [error, setError] = useState(false)
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)

  const fetchCredentials = async () => {
    setIsLoading(true)
    setError(false)
    try {
      const r = await api('/api/v1/credentials')
      if (r.ok) setCredentials(await r.json())
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCredentials() }, [])

  const toggleProvider = (p: string) => {
    setExpandedProvider(prev => prev === p ? null : p)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">{t('settings.title')}</h2>

      {/* Language */}
      <div className="mb-8">
        <h3 className="text-base font-bold">{t('settings.language')}</h3>
        <p className="text-xs text-text-muted mt-0.5 mb-2">{t('settings.language_description')}</p>
        <div className="card">
          <div className="px-5 py-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Credentials */}
      <div className="mb-8">
        <h3 className="text-base font-bold">{t('settings.credentials')}</h3>
        <p className="text-xs text-text-muted mt-0.5 mb-2">{t('settings.credentials_description')}</p>
        {isLoading ? (
          <div className="card">
            <div className="px-5 py-4 text-sm text-text-muted">{t('common.loading')}</div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="px-5 py-4">
              <div className="error-message flex items-center justify-between">
                <span>{t('common.load_error')}</span>
                <button className="btn-icon text-xs" onClick={fetchCredentials}>{t('common.retry')}</button>
              </div>
            </div>
          </div>
        ) : credentials ? (
          <div className="card">
            {/* Enable Banking */}
            <div className="px-5 py-4 border-b-2 border-border">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">{t('settings.enable_banking')}</p>
                    <span className={`status-dot ${credentials.enable_banking.configured ? 'status-dot-active' : 'status-dot-inactive'}`}>
                      {credentials.enable_banking.configured ? t('settings.configured') : t('settings.not_configured')}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{t('settings.enable_banking_description')}</p>
                </div>
                <button
                  className="btn btn-ghost text-sm shrink-0 ml-4 px-4 py-2"
                  onClick={() => toggleProvider('enable_banking')}
                >
                  {credentials.enable_banking.configured ? t('settings.update_credentials') : t('settings.configure')}
                </button>
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
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">{t('settings.gocardless')}</p>
                    <span className={`status-dot ${credentials.gocardless.configured ? 'status-dot-active' : 'status-dot-inactive'}`}>
                      {credentials.gocardless.configured ? t('settings.configured') : t('settings.not_configured')}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{t('settings.gocardless_description')}</p>
                </div>
                <button
                  className="btn btn-ghost text-sm shrink-0 ml-4 px-4 py-2"
                  onClick={() => toggleProvider('gocardless')}
                >
                  {credentials.gocardless.configured ? t('settings.update_credentials') : t('settings.configure')}
                </button>
              </div>
              {expandedProvider === 'gocardless' && (
                <CredentialForm
                  provider="gocardless"
                  isConfigured={credentials.gocardless.configured}
                  onSaved={() => { fetchCredentials(); setExpandedProvider(null) }}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* AI Categorization */}
      <div className="mb-8">
        <h3 className="text-base font-bold">{t('settings.llm')}</h3>
        <p className="text-xs text-text-muted mt-0.5 mb-2">{t('settings.llm_description')}</p>
        {credentials ? (
          <div className="card">
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">{t('settings.llm_provider')}</p>
                    <span className={`status-dot ${credentials.llm.configured ? 'status-dot-active' : 'status-dot-inactive'}`}>
                      {credentials.llm.configured ? t('settings.configured') : t('settings.not_configured')}
                    </span>
                  </div>
                  {credentials.llm.configured && (
                    <p className="text-xs text-text-muted mt-0.5 mono">{credentials.llm.base_url} — {credentials.llm.llm_model}</p>
                  )}
                </div>
                <button
                  className="btn btn-ghost text-sm shrink-0 ml-4 px-4 py-2"
                  onClick={() => toggleProvider('llm')}
                >
                  {credentials.llm.configured ? t('settings.update_credentials') : t('settings.configure')}
                </button>
              </div>
              {expandedProvider === 'llm' && (
                <CredentialForm
                  provider="llm"
                  isConfigured={credentials.llm.configured}
                  onSaved={() => { fetchCredentials(); setExpandedProvider(null) }}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Connect Bank */}
      <div>
        <h3 className="text-base font-bold">{t('settings.connect_bank')}</h3>
        <p className="text-xs text-text-muted mt-0.5 mb-2">{t('settings.connect_bank_description')}</p>
        <div className="card">
          <div className="px-5 py-4">
            {credentials && <ConnectBankFlow credentials={credentials} />}
          </div>
        </div>
      </div>
    </div>
  )
}
