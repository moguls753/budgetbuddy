import type { ReactNode } from 'react'

export type View = 'dashboard' | 'transactions' | 'accounts' | 'categories' | 'recurring' | 'statistics' | 'settings'

interface SidebarNavProps {
  currentView: View
  onNavigate: (view: View) => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

const navItems: { view: View; label: string; icon: ReactNode }[] = [
  {
    view: 'dashboard',
    label: 'Dashboard',
    icon: (
      // Grid icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    view: 'transactions',
    label: 'Transactions',
    icon: (
      // Arrows up-down icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="7" y1="4" x2="7" y2="20" />
        <polyline points="3 8 7 4 11 8" />
        <line x1="17" y1="20" x2="17" y2="4" />
        <polyline points="13 16 17 20 21 16" />
      </svg>
    ),
  },
  {
    view: 'accounts',
    label: 'Accounts',
    icon: (
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
  },
  {
    view: 'categories',
    label: 'Categories',
    icon: (
      // Tag icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    view: 'recurring',
    label: 'Recurring',
    icon: (
      // Repeat icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    view: 'statistics',
    label: 'Statistics',
    icon: (
      // Bar chart icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    view: 'settings',
    label: 'Settings',
    icon: (
      // Gear icon
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

// Settings is the last item, separated to the bottom
const mainItems = navItems.filter(item => item.view !== 'settings')
const settingsItem = navItems.find(item => item.view === 'settings')!

export default function SidebarNav({ currentView, onNavigate, collapsed = false, onToggleCollapsed }: SidebarNavProps) {
  const itemClass = (view: View) =>
    `nav-item nav-stagger${currentView === view ? ' nav-item-active' : ''}${collapsed ? ' nav-item-collapsed' : ''}`

  return (
    <nav className="flex flex-col flex-1 py-2">
      <div className="flex flex-col gap-0.5">
        {mainItems.map((item, i) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`${itemClass(item.view)} nav-stagger-${i + 1}`}
            data-tooltip={item.label}
            aria-label={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Settings + collapse toggle pushed to bottom */}
      <div className="mt-auto pt-2 border-t-2 border-border">
        <button
          onClick={() => onNavigate(settingsItem.view)}
          className={`${itemClass('settings')} nav-stagger-7`}
          data-tooltip={settingsItem.label}
          aria-label={collapsed ? settingsItem.label : undefined}
        >
          {settingsItem.icon}
          {!collapsed && <span>{settingsItem.label}</span>}
        </button>

        {/* Collapse/expand toggle — only rendered on desktop */}
        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className={`nav-item sidebar-toggle${collapsed ? ' nav-item-collapsed' : ''}`}
            data-tooltip={collapsed ? 'Expand' : 'Collapse'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </nav>
  )
}
