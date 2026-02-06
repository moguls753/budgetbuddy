import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export type View = 'dashboard' | 'transactions' | 'accounts' | 'categories' | 'recurring' | 'statistics' | 'settings'

interface SidebarNavProps {
  currentView: View
  onNavigate: (view: View) => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

const navIcons: Record<View, ReactNode> = {
  dashboard: (
    // Grid icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  transactions: (
    // Arrows up-down icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="4" x2="7" y2="20" />
      <polyline points="3 8 7 4 11 8" />
      <line x1="17" y1="20" x2="17" y2="4" />
      <polyline points="13 16 17 20 21 16" />
    </svg>
  ),
  accounts: (
    // Building icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" />
      <line x1="9" y1="6" x2="9.01" y2="6" />
      <line x1="15" y1="6" x2="15.01" y2="6" />
      <line x1="9" y1="10" x2="9.01" y2="10" />
      <line x1="15" y1="10" x2="15.01" y2="10" />
      <line x1="9" y1="14" x2="9.01" y2="14" />
      <line x1="15" y1="14" x2="15.01" y2="14" />
      <line x1="9" y1="22" x2="9" y2="18" />
      <line x1="15" y1="22" x2="15" y2="18" />
    </svg>
  ),
  categories: (
    // Tag icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  recurring: (
    // Repeat icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  statistics: (
    // Bar chart icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  settings: (
    // Gear icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

const viewOrder: View[] = ['dashboard', 'transactions', 'accounts', 'categories', 'recurring', 'statistics', 'settings']

export default function SidebarNav({ currentView, onNavigate, collapsed = false, onToggleCollapsed }: SidebarNavProps) {
  const { t } = useTranslation()

  const itemClass = (view: View) =>
    `nav-item nav-stagger${currentView === view ? ' nav-item-active' : ''}${collapsed ? ' nav-item-collapsed' : ''}`

  return (
    <nav className="flex flex-col flex-1 py-2">
      {/* All 7 nav items in one group */}
      <div className="flex flex-col gap-0.5">
        {viewOrder.map((view, i) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`${itemClass(view)} nav-stagger-${i + 1}`}
            data-tooltip={t(`nav.${view}`)}
            aria-label={collapsed ? t(`nav.${view}`) : undefined}
          >
            {navIcons[view]}
            {!collapsed && <span>{t(`nav.${view}`)}</span>}
          </button>
        ))}
      </div>

      {/* Collapse toggle — structural control, not navigation */}
      {onToggleCollapsed && (
        <div className="mt-auto pt-2 border-t-2 border-border">
          <button
            onClick={onToggleCollapsed}
            className={`nav-item sidebar-toggle${collapsed ? ' nav-item-collapsed' : ''}`}
            data-tooltip={collapsed ? t('common.expand') : t('common.collapse')}
            aria-label={collapsed ? t('common.expand_sidebar') : t('common.collapse_sidebar')}
          >
            {collapsed ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            )}
            {!collapsed && <span>{t('common.collapse')}</span>}
          </button>
        </div>
      )}
    </nav>
  )
}
