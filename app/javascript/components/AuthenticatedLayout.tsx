import { useState, useEffect } from 'react'
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

const pages: Record<View, () => React.JSX.Element> = {
  dashboard: DashboardPage,
  transactions: TransactionsPage,
  accounts: AccountsPage,
  categories: CategoriesPage,
  recurring: RecurringPage,
  statistics: StatisticsPage,
  settings: SettingsPage,
}

export default function AuthenticatedLayout({ user, onLogout }: AuthenticatedLayoutProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    }
    return false
  })

  // Persist collapsed preference
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

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
    <div className="min-h-screen flex">
      {/* Desktop sidebar — always visible at lg+, collapsible */}
      <aside className="hidden lg:flex flex-col flex-shrink-0">
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
        <main className="flex-1 overflow-y-auto bg-surface">
          <ActivePage />
        </main>
      </div>
    </div>
  )
}
