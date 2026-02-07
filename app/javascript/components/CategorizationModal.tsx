import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import type { View } from './SidebarNav'

interface Props {
  onClose: (didCategorize: boolean) => void
  onNavigate?: (view: View) => void
}

type Step = 'loading' | 'confirm' | 'running' | 'done' | 'error'

export default function CategorizationModal({ onClose, onNavigate }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('loading')
  const [count, setCount] = useState(0)
  const [results, setResults] = useState<{ total: number; categorized: number; failed: number; breakdown?: Record<string, number> } | null>(null)

  useEffect(() => {
    api('/api/v1/transactions?uncategorized=true&per=1')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setCount(data.meta.total)
          setStep(data.meta.total > 0 ? 'confirm' : 'done')
          if (data.meta.total === 0) setResults({ total: 0, categorized: 0, failed: 0 })
        } else {
          setStep('error')
        }
      })
      .catch(() => setStep('error'))
  }, [])

  const handleCategorize = async () => {
    setStep('running')
    try {
      const r = await api('/api/v1/transactions/categorize', { method: 'POST' })
      if (r.ok) {
        setResults(await r.json())
        setStep('done')
      } else {
        setStep('error')
      }
    } catch {
      setStep('error')
    }
  }

  const didCategorize = results !== null && results.categorized > 0
  const dismissable = step !== 'running' && step !== 'loading'

  return (
    <div className="modal-backdrop" onClick={() => dismissable && onClose(didCategorize)}>
      <div
        className={`modal-dialog ${step === 'running' ? 'modal-dialog-processing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {step === 'loading' && (
          <div className="flex items-center gap-3">
            <span className="spinner text-text-muted" />
            <p className="text-sm text-text-muted">{t('common.loading')}</p>
          </div>
        )}

        {step === 'confirm' && (
          <>
            <h3 className="text-base font-bold mb-1">{t('transactions.categorize_title')}</h3>
            <p className="text-sm text-text-muted mb-5">
              {t('transactions.categorize_confirm', { count })}
            </p>
            <div className="flex items-center gap-3">
              <button className="btn btn-primary text-sm px-4 py-2" onClick={handleCategorize}>
                {t('transactions.categorize')}
              </button>
              <button className="btn btn-ghost text-sm px-4 py-2" onClick={() => onClose(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </>
        )}

        {step === 'running' && (
          <div className="flex items-center gap-3">
            <span className="spinner text-accent" />
            <div>
              <p className="text-sm font-semibold">{t('transactions.categorizing')}</p>
              <p className="text-xs text-text-muted mt-0.5">{t('transactions.categorize_wait')}</p>
            </div>
          </div>
        )}

        {step === 'done' && results && (
          <>
            {results.total === 0 ? (
              <p className="text-sm text-text-muted">{t('transactions.categorize_none')}</p>
            ) : (
              <>
                <h3 className="text-base font-bold mb-2">{t('transactions.categorize_done')}</h3>
                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="mono text-2xl font-bold text-accent">{results.categorized}</p>
                    <p className="text-xs text-text-muted">{t('transactions.categorize_matched')}</p>
                  </div>
                  {results.failed > 0 && (
                    <div>
                      <p className="mono text-2xl font-bold text-error">{results.failed}</p>
                      <p className="text-xs text-text-muted">{t('transactions.categorize_errors')}</p>
                    </div>
                  )}
                  {(results.total - results.categorized - results.failed) > 0 && (
                    <div>
                      <p className="mono text-2xl font-bold text-text-muted">{results.total - results.categorized - results.failed}</p>
                      <p className="text-xs text-text-muted">{t('transactions.categorize_unmatched')}</p>
                    </div>
                  )}
                </div>

                {results.breakdown && Object.keys(results.breakdown).length > 0 && (
                  <div className="border-t-2 border-border pt-3 mb-4 max-h-48 overflow-y-auto">
                    {Object.entries(results.breakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between py-1">
                          <span className="text-sm truncate mr-4">{name}</span>
                          <span className="mono text-sm font-semibold text-text-muted shrink-0">{count}</span>
                        </div>
                      ))}
                  </div>
                )}

                {(results.total - results.categorized - results.failed) > 0 && onNavigate && (
                  <div className="border-t-2 border-border pt-3 mb-4">
                    <p className="text-xs text-text-muted mb-2">{t('transactions.categorize_unmatched_hint')}</p>
                    <button
                      className="link text-sm cursor-pointer"
                      onClick={() => { onClose(didCategorize); onNavigate('categories') }}
                    >
                      {t('transactions.categorize_add_categories')} →
                    </button>
                  </div>
                )}
              </>
            )}
            <button className="btn btn-ghost text-sm px-4 py-2" onClick={() => onClose(didCategorize)}>
              {t('transactions.categorize_close')}
            </button>
          </>
        )}

        {step === 'error' && (
          <>
            <div className="error-message mb-4">{t('common.error')}</div>
            <button className="btn btn-ghost text-sm px-4 py-2" onClick={() => onClose(didCategorize)}>
              {t('transactions.categorize_close')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
