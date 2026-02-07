import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'

interface CredentialFormProps {
  provider: 'enable_banking' | 'gocardless'
  isConfigured: boolean
  onSaved: () => void
}

export default function CredentialForm({ provider, isConfigured, onSaved }: CredentialFormProps) {
  const { t } = useTranslation()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Enable Banking fields
  const [appId, setAppId] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  // GoCardless fields
  const [secretId, setSecretId] = useState('')
  const [secretKey, setSecretKey] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    const method = isConfigured ? 'PATCH' : 'POST'
    const credentials = provider === 'enable_banking'
      ? { app_id: appId, private_key_pem: privateKey }
      : { secret_id: secretId, secret_key: secretKey }

    try {
      const r = await api('/api/v1/credentials', {
        method,
        body: { provider, credentials },
      })
      if (r.ok) {
        onSaved()
      } else {
        const data = await r.json()
        setError(data.errors?.[0] || data.error || t('common.error'))
      }
    } catch {
      setError(t('common.error'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pt-3 flex flex-col gap-3">
      {provider === 'enable_banking' ? (
        <>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
              {t('settings.app_id')}
            </label>
            <input
              className="input"
              style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}
              value={appId}
              onChange={e => setAppId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
              {t('settings.private_key')}
            </label>
            <textarea
              className="input mono"
              style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', minHeight: '8rem', resize: 'vertical' }}
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              placeholder="-----BEGIN RSA PRIVATE KEY-----"
              required
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
              {t('settings.secret_id')}
            </label>
            <input
              className="input"
              style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}
              value={secretId}
              onChange={e => setSecretId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
              {t('settings.secret_key')}
            </label>
            <input
              className="input"
              type="password"
              style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              required
            />
          </div>
        </>
      )}

      {error && <div className="error-message">{error}</div>}

      <button className="btn btn-primary text-sm self-start" disabled={isSaving}>
        {isSaving ? t('settings.saving') : t('settings.save_credentials')}
      </button>
    </form>
  )
}
