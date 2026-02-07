import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import { formatAmount, formatRelativeTime, maskIban } from '../lib/format'
import type { BankConnection } from '../lib/types'
import type { View } from '../components/SidebarNav'

interface AccountsPageProps {
  onNavigate?: (view: View) => void
}

export default function AccountsPage({ onNavigate }: AccountsPageProps) {
  const { t } = useTranslation()
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set())
  const pollTimers = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map())

  const fetchConnections = async () => {
    setIsLoading(true)
    setError(false)
    try {
      const r = await api('/api/v1/bank_connections')
      if (r.ok) setConnections(await r.json())
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchConnections() }, [])

  // Clean up poll timers on unmount
  useEffect(() => {
    const timers = pollTimers.current
    return () => { timers.forEach(t => clearInterval(t)) }
  }, [])

  const stopPolling = useCallback((id: number) => {
    const timer = pollTimers.current.get(id)
    if (timer) { clearInterval(timer); pollTimers.current.delete(id) }
    setSyncingIds(prev => { const next = new Set(prev); next.delete(id); return next })
  }, [])

  const handleSync = async (id: number) => {
    const beforeSync = connections.find(c => c.id === id)?.last_synced_at
    setSyncingIds(prev => new Set(prev).add(id))
    try {
      const r = await api(`/api/v1/bank_connections/${id}/sync`, { method: 'POST' })
      if (!r.ok) { stopPolling(id); return }

      // Poll every 3s — stop when last_synced_at changes or after 30s
      const startedAt = Date.now()
      const timer = setInterval(async () => {
        try {
          const pr = await api('/api/v1/bank_connections')
          if (pr.ok) {
            const fresh: BankConnection[] = await pr.json()
            setConnections(fresh)
            const updated = fresh.find(c => c.id === id)
            if (updated?.last_synced_at !== beforeSync) { stopPolling(id); return }
          }
        } catch { /* polling failure is not critical */ }
        if (Date.now() - startedAt > 30000) stopPolling(id)
      }, 3000)
      pollTimers.current.set(id, timer)
    } catch {
      stopPolling(id)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('accounts.delete_confirm'))) return
    try {
      const r = await api(`/api/v1/bank_connections/${id}`, { method: 'DELETE' })
      if (r.ok || r.status === 204) {
        setConnections(prev => prev.filter(c => c.id !== id))
      }
    } catch {
      // silent
    }
  }

  const statusBadge = (status: string) => {
    const key = `accounts.status_${status}` as const
    const label = t(key)
    if (status === 'authorized') return <span className="badge badge-accent">{label}</span>
    if (status === 'expired' || status === 'error') return <span className="badge badge-error">{label}</span>
    return <span className="badge badge-muted">{label}</span>
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('accounts.title')}</h2>
        <div className="text-sm text-text-muted">{t('common.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('accounts.title')}</h2>
        <div className="error-message flex items-center justify-between">
          <span>{t('common.load_error')}</span>
          <button className="btn-icon text-xs" onClick={fetchConnections}>{t('common.retry')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('accounts.title')}</h2>
        <button className="btn btn-primary text-sm" onClick={() => onNavigate?.('settings')}>
          {t('accounts.connect_bank')}
        </button>
      </div>

      {connections.length === 0 ? (
        <div className="card p-12 text-center row-enter">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          <p className="text-lg font-medium mb-2">{t('accounts.empty_title')}</p>
          <p className="text-sm text-text-muted">{t('accounts.empty_description')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {connections.map((bc, i) => (
            <div key={bc.id} className="card row-enter" style={{ animationDelay: `${i * 0.05}s` }}>
              {/* Connection header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <p className="font-semibold truncate">{bc.institution_name || bc.institution_id}</p>
                  {statusBadge(bc.status)}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    className="btn-icon text-xs"
                    onClick={() => handleSync(bc.id)}
                    disabled={syncingIds.has(bc.id) || bc.status !== 'authorized'}
                  >
                    {syncingIds.has(bc.id) ? t('accounts.syncing') : t('accounts.sync')}
                  </button>
                  <button
                    className="btn-icon text-xs"
                    onClick={() => handleDelete(bc.id)}
                  >
                    {t('accounts.delete_connection')}
                  </button>
                </div>
              </div>

              {/* Account rows */}
              {bc.accounts.map(acct => (
                <div key={acct.id} className="flex items-center justify-between px-4 py-3 border-b-2 border-border last:border-b-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{acct.name || 'Account'}</p>
                    <p className="mono text-xs text-text-muted mt-0.5">{maskIban(acct.iban)}</p>
                  </div>
                  <p className="mono text-lg font-semibold whitespace-nowrap ml-4">
                    {acct.balance_amount ? formatAmount(acct.balance_amount, acct.currency) : '—'}
                  </p>
                </div>
              ))}

              {/* Footer — last synced */}
              {bc.accounts.length === 0 && (
                <div className="px-4 py-3 text-xs text-text-muted italic">
                  {t('accounts.never_synced')}
                </div>
              )}
              {bc.last_synced_at && (
                <div className="px-4 py-2 text-xs text-text-muted border-t-2 border-border">
                  {t('accounts.last_synced', { time: formatRelativeTime(bc.last_synced_at) })}
                </div>
              )}
              {bc.error_message && (
                <div className="px-4 py-2 text-xs text-error border-t-2 border-border">
                  {bc.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
