import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle'
import { api } from '../lib/api'

interface TopBarProps {
  email: string
  onLogout: () => void
  onMenuToggle: () => void
}

export default function TopBar({ email, onLogout, onMenuToggle }: TopBarProps) {
  const { t } = useTranslation()

  const handleLogout = async () => {
    try {
      const response = await api('/session', { method: 'DELETE' })
      if (response.ok || response.status === 204) {
        onLogout()
      }
    } catch {
      onLogout()
    }
  }

  return (
    <header className="topbar">
      {/* Hamburger — visible only on mobile */}
      <button
        onClick={onMenuToggle}
        className="btn-icon lg:hidden mr-auto"
        aria-label={t('common.open_nav')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        <span className="text-sm hidden sm:inline text-text-muted">
          {email}
        </span>
        <ThemeToggle />
        <button onClick={handleLogout} className="btn-icon">
          {t('common.sign_out')}
        </button>
      </div>
    </header>
  )
}
