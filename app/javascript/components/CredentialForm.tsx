import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'

interface CredentialFormProps {
  provider: 'enable_banking' | 'gocardless' | 'llm'
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

  // LLM fields
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [llmModel, setLlmModel] = useState('')

  // Test connection
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ status: 'ok' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setTestResult(null)

    const method = isConfigured ? 'PATCH' : 'POST'
    let credentials: Record<string, string>
    if (provider === 'enable_banking') {
      credentials = { app_id: appId, private_key_pem: privateKey }
    } else if (provider === 'gocardless') {
      credentials = { secret_id: secretId, secret_key: secretKey }
    } else {
      credentials = { base_url: baseUrl, llm_model: llmModel, api_key: apiKey || '' }
    }

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

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const r = await api('/api/v1/credentials/test', { method: 'POST' })
      const data = await r.json()
      setTestResult(data)
    } catch {
      setTestResult({ status: 'error', message: t('common.error') })
    } finally {
      setIsTesting(false)
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
      ) : provider === 'gocardless' ? (
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
      ) : (
        <>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
              {t('settings.llm_endpoint')}
            </label>
            <input
              className="input"
              style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
              {t('settings.llm_api_key')}
            </label>
            <input
              className="input"
              type="password"
              style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={t('settings.llm_api_key_placeholder')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
              {t('settings.llm_model')}
            </label>
            <input
              className="input"
              style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}
              value={llmModel}
              onChange={e => setLlmModel(e.target.value)}
              placeholder="gpt-4o-mini"
              required
            />
          </div>
        </>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="flex items-center gap-3">
        <button className="btn btn-primary text-sm" style={{ padding: '0.5rem 1rem' }} disabled={isSaving}>
          {isSaving ? t('settings.saving') : t('settings.save_credentials')}
        </button>

        {provider === 'llm' && isConfigured && (
          <button
            type="button"
            className="btn btn-ghost text-sm"
            style={{ padding: '0.5rem 1rem' }}
            onClick={handleTest}
            disabled={isTesting}
          >
            {isTesting ? t('settings.llm_testing') : t('settings.llm_test')}
          </button>
        )}
      </div>

      {testResult && (
        <div className={testResult.status === 'ok' ? 'success-message' : 'error-message'}>
          {testResult.status === 'ok' ? t('settings.llm_test_ok') : testResult.message}
        </div>
      )}
    </form>
  )
}
