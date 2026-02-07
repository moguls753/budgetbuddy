import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { View } from './SidebarNav'
import DashboardPage from '../pages/DashboardPage'
import TransactionsPage from '../pages/TransactionsPage'
import AccountsPage from '../pages/AccountsPage'
import CategoriesPage from '../pages/CategoriesPage'
import RecurringPage from '../pages/RecurringPage'
import StatisticsPage from '../pages/StatisticsPage'
import SettingsPage from '../pages/SettingsPage'

interface AuthenticatedLayoutProps {
  user: { id: number; email_address: string }
  onLogout: () => void
}

type PageComponent = (props: { onNavigate?: (view: View) => void }) => React.JSX.Element

const pages: Record<View, PageComponent> = {
  dashboard: DashboardPage,
  transactions: TransactionsPage,
  accounts: AccountsPage,
  categories: CategoriesPage,
  recurring: RecurringPage,
  statistics: StatisticsPage,
  settings: SettingsPage,
}

export default function AuthenticatedLayout({ user, onLogout }: AuthenticatedLayoutProps) {
  const { t } = useTranslation()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    }
    return false
  })
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Persist collapsed preference
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Detect bank connection callback URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const successId = params.get('bank_connection_success')
    const errorId = params.get('bank_connection_error')

    if (successId) {
      setNotification({ type: 'success', message: t('settings.bank_connected') })
      setCurrentView('accounts')
      window.history.replaceState({}, '', '/')
    } else if (errorId) {
      setNotification({ type: 'error', message: t('settings.bank_connection_error') })
      setCurrentView('settings')
      window.history.replaceState({}, '', '/')
    }
  }, [t])

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Close sidebar on navigate (mobile)
  const handleNavigate = (view: View) => {
    setCurrentView(view)
    setSidebarOpen(false)
  }

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const ActivePage = pages[currentView]

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar — always visible at lg+, collapsible */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 h-full">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(prev => !prev)}
        />
      </aside>

      {/* Mobile sidebar — overlay with slide + backdrop */}
      {/* Always in DOM for CSS transition. Never collapsed. */}
      <div
        className={`lg:hidden sidebar-backdrop${sidebarOpen ? ' sidebar-backdrop-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
        aria-hidden={!sidebarOpen}
      />
      <aside
        className={`lg:hidden sidebar-mobile${sidebarOpen ? ' sidebar-mobile-open' : ''}`}
        aria-hidden={!sidebarOpen}
      >
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      </aside>

      {/* Main area — fills remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          email={user.email_address}
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Notification bar */}
        {notification && (
          <div className={`notification-bar ${notification.type === 'success' ? 'success-message' : 'error-message'}`}>
            <span>{notification.message}</span>
            <button
              className="text-xs font-semibold uppercase tracking-wider cursor-pointer opacity-70 hover:opacity-100"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-surface">
          <ActivePage onNavigate={handleNavigate} />
        </main>
      </div>
    </div>
  )
}
