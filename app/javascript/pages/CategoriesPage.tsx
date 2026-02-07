import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import type { Category } from '../lib/types'

export default function CategoriesPage() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')
  const addRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  const fetchCategories = async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const r = await api('/api/v1/categories')
      if (r.ok) setCategories(await r.json())
      else setLoadError(true)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  useEffect(() => { if (isAdding) addRef.current?.focus() }, [isAdding])
  useEffect(() => { if (editingId) editRef.current?.focus() }, [editingId])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setError('')
    const r = await api('/api/v1/categories', { method: 'POST', body: { category: { name: newName.trim() } } })
    if (r.ok) {
      const created = await r.json()
      setCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setIsAdding(false)
    } else {
      const data = await r.json()
      setError(data.errors?.[0] || t('common.error'))
    }
  }

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return
    setError('')
    const r = await api(`/api/v1/categories/${id}`, { method: 'PATCH', body: { category: { name: editName.trim() } } })
    if (r.ok) {
      const updated = await r.json()
      setCategories(prev => prev.map(c => c.id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)))
      setEditingId(null)
    } else {
      const data = await r.json()
      setError(data.errors?.[0] || t('common.error'))
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('categories.delete_confirm'))) return
    const r = await api(`/api/v1/categories/${id}`, { method: 'DELETE' })
    if (r.ok || r.status === 204) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setIsAdding(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('categories.title')}</h2>
        <div className="text-sm text-text-muted">{t('common.loading')}</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('categories.title')}</h2>
        <div className="error-message flex items-center justify-between">
          <span>{t('common.load_error')}</span>
          <button className="btn-icon text-xs" onClick={fetchCategories}>{t('common.retry')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('categories.title')}</h2>
        {!isAdding && (
          <button className="btn btn-primary text-sm" onClick={() => { setIsAdding(true); setEditingId(null) }}>
            {t('categories.add')}
          </button>
        )}
      </div>

      {error && <div className="error-message mb-4">{error}</div>}

      {categories.length === 0 && !isAdding ? (
        <div className="card p-12 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <p className="text-lg font-medium mb-2">{t('categories.empty_title')}</p>
          <p className="text-sm text-text-muted">{t('categories.empty_description')}</p>
        </div>
      ) : (
        <div className="card">
          {/* Add row */}
          {isAdding && (
            <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border">
              <input
                ref={addRef}
                className="input flex-1"
                style={{ padding: '0.5rem 0.75rem' }}
                placeholder={t('categories.name_placeholder')}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') { setIsAdding(false); setNewName('') }
                }}
              />
              <button className="btn-icon" onClick={handleCreate}>
                {t('common.save')}
              </button>
              <button className="btn-icon" onClick={() => { setIsAdding(false); setNewName('') }}>
                {t('common.cancel')}
              </button>
            </div>
          )}

          {/* Category rows */}
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="flex items-center justify-between px-4 py-3 border-b-2 border-border last:border-b-0"
            >
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    ref={editRef}
                    className="input flex-1"
                    style={{ padding: '0.5rem 0.75rem' }}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleUpdate(cat.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                  <button className="btn-icon" onClick={() => handleUpdate(cat.id)}>
                    {t('common.save')}
                  </button>
                  <button className="btn-icon" onClick={() => setEditingId(null)}>
                    {t('common.cancel')}
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button className="btn-icon text-xs" onClick={() => startEdit(cat)}>
                      {t('common.edit')}
                    </button>
                    <button className="btn-icon text-xs" onClick={() => handleDelete(cat.id)}>
                      {t('common.delete')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
