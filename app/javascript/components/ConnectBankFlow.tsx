import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import type { CredentialsStatus } from '../lib/types'

interface ConnectBankFlowProps {
  credentials: CredentialsStatus
}

type FlowStep = 'idle' | 'select_provider' | 'select_country' | 'select_institution' | 'connecting'

interface Institution {
  name: string    // EB: institution ID, GC: display name
  id?: string     // GC: institution ID
  logo?: string
  [key: string]: unknown
}

const countries = [
  { code: 'DE', name: 'Germany' },
  { code: 'AT', name: 'Austria' },
  { code: 'FI', name: 'Finland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LV', name: 'Latvia' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
]

export default function ConnectBankFlow({ credentials }: ConnectBankFlowProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<FlowStep>('idle')
  const [provider, setProvider] = useState('')
  const [country, setCountry] = useState('')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [institutionSearch, setInstitutionSearch] = useState('')
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false)
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const hasEB = credentials.enable_banking.configured
  const hasGC = credentials.gocardless.configured
  const providerCount = (hasEB ? 1 : 0) + (hasGC ? 1 : 0)

  // Fetch institutions when country changes
  useEffect(() => {
    if (step !== 'select_institution' || !country || !provider) return
    setIsLoadingInstitutions(true)
    setError('')
    api(`/api/v1/institutions?provider=${provider}&country=${country}`)
      .then(async r => {
        if (r.ok) {
          setInstitutions(await r.json())
        } else {
          const data = await r.json()
          setError(data.error || t('common.error'))
        }
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setIsLoadingInstitutions(false))
  }, [step, country, provider, t])

  const startFlow = () => {
    if (providerCount === 1) {
      setProvider(hasEB ? 'enable_banking' : 'gocardless')
      setStep('select_country')
    } else {
      setStep('select_provider')
    }
  }

  const selectProvider = (p: string) => {
    setProvider(p)
    setStep('select_country')
  }

  const selectCountry = (code: string) => {
    setCountry(code)
    setInstitutions([])
    setInstitutionSearch('')
    setStep('select_institution')
  }

  const selectInstitution = async (inst: Institution) => {
    setIsConnecting(true)
    setError('')
    try {
      // EB: name is the ID (e.g. "Sparkasse Berlin"), no separate display name
      // GC: id is the ID (e.g. "TOMORROW_SOLDE1S"), name is the display name
      const institutionId = (inst.id as string) || inst.name
      const institutionName = inst.name
      const r = await api('/api/v1/bank_connections', {
        method: 'POST',
        body: {
          provider,
          institution_id: institutionId,
          institution_name: institutionName,
          country_code: country,
        },
      })
      if (r.ok) {
        const data = await r.json()
        window.location.href = data.redirect_url
      } else {
        const data = await r.json()
        setError(data.error || data.errors?.[0] || t('common.error'))
        setIsConnecting(false)
      }
    } catch {
      setError(t('common.error'))
      setIsConnecting(false)
    }
  }

  const goBack = () => {
    if (step === 'select_institution') {
      setStep('select_country')
    } else if (step === 'select_country') {
      if (providerCount > 1) setStep('select_provider')
      else setStep('idle')
    } else if (step === 'select_provider') {
      setStep('idle')
    }
  }

  const filteredInstitutions = institutions.filter(inst =>
    (inst.name || '').toLowerCase().includes(institutionSearch.toLowerCase())
  )

  if (!hasEB && !hasGC) {
    return (
      <p className="text-sm text-text-muted italic">{t('settings.no_credentials')}</p>
    )
  }

  if (step === 'idle') {
    return (
      <button className="btn btn-primary text-sm" style={{ padding: '0.5rem 1rem' }} onClick={startFlow}>
        {t('settings.connect_bank')}
      </button>
    )
  }

  if (isConnecting) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-text-muted">{t('settings.redirecting')}</p>
      </div>
    )
  }

  return (
    <div>
      <button className="link text-xs font-semibold uppercase tracking-wider mb-4 cursor-pointer" onClick={goBack}>
        {t('common.back')}
      </button>

      {error && <div className="error-message mb-4">{error}</div>}

      {/* Select provider */}
      {step === 'select_provider' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            {t('settings.select_provider')}
          </p>
          <div className="flex flex-col gap-2">
            {hasEB && (
              <button
                className="card p-4 text-left cursor-pointer hover:bg-surface-sunken transition-colors"
                onClick={() => selectProvider('enable_banking')}
              >
                <p className="font-semibold text-sm">{t('settings.enable_banking')}</p>
                <p className="text-xs text-text-muted mt-0.5">{t('settings.enable_banking_description')}</p>
              </button>
            )}
            {hasGC && (
              <button
                className="card p-4 text-left cursor-pointer hover:bg-surface-sunken transition-colors"
                onClick={() => selectProvider('gocardless')}
              >
                <p className="font-semibold text-sm">{t('settings.gocardless')}</p>
                <p className="text-xs text-text-muted mt-0.5">{t('settings.gocardless_description')}</p>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Select country */}
      {step === 'select_country' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            {t('settings.select_country')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {countries.map(c => (
              <button
                key={c.code}
                className="card p-3 text-left text-sm font-medium cursor-pointer hover:bg-surface-sunken transition-colors"
                onClick={() => selectCountry(c.code)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Select institution */}
      {step === 'select_institution' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            {t('settings.select_institution')}
          </p>
          <input
            className="input mb-3"
            style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}
            placeholder={t('settings.search_institutions')}
            value={institutionSearch}
            onChange={e => setInstitutionSearch(e.target.value)}
            autoFocus
          />
          <div className="card overflow-y-auto" style={{ maxHeight: '20rem' }}>
            {isLoadingInstitutions ? (
              <div className="p-4 text-sm text-text-muted">{t('common.loading')}</div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="p-4 text-sm text-text-muted">{t('settings.no_institutions')}</div>
            ) : (
              filteredInstitutions.map((inst, i) => (
                <button
                  key={inst.name + i}
                  className="w-full text-left px-4 py-3 text-sm font-medium border-b-2 border-border last:border-b-0 cursor-pointer hover:bg-surface-sunken transition-colors"
                  onClick={() => selectInstitution(inst)}
                >
                  {inst.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
