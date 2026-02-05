import ThemeToggle from './ThemeToggle'
import { api } from '../lib/api'

interface DashboardProps {
  user: { id: number; email_address: string }
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const handleLogout = async () => {
    try {
      const response = await api('/session', { method: 'DELETE' })
      if (response.ok || response.status === 204) {
        onLogout()
      }
    } catch {
      // Even if request fails, clear local state
      onLogout()
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Header */}
      <header
        className="border-b-2 px-6 py-3 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--color-surface-raised)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h1
          className="text-lg font-bold"
          style={{ color: 'var(--color-text)' }}
        >
          BudgetBuddy
        </h1>

        <div className="flex items-center gap-3">
          <span
            className="text-sm hidden sm:inline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {user.email_address}
          </span>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn-icon">
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 max-w-6xl mx-auto">
        {/* Balance card */}
        <div className="card p-8 mb-8">
          <p
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Total Balance
          </p>
          <p
            className="text-5xl font-bold mono"
            style={{ color: 'var(--color-text)' }}
          >
            0,00 €
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No accounts connected yet
          </p>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Income this month
            </p>
            <p
              className="text-2xl font-bold mono"
              style={{ color: 'var(--color-accent)' }}
            >
              +0,00 €
            </p>
          </div>

          <div className="card p-6">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Expenses this month
            </p>
            <p
              className="text-2xl font-bold mono"
              style={{ color: 'var(--color-text)' }}
            >
              −0,00 €
            </p>
          </div>

          <div className="card p-6">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Transactions
            </p>
            <p
              className="text-2xl font-bold mono"
              style={{ color: 'var(--color-text)' }}
            >
              0
            </p>
          </div>
        </div>

        {/* Empty state */}
        <div className="card p-12 text-center">
          <p
            className="text-lg font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            No transactions yet
          </p>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Connect your bank account to start tracking your finances.
          </p>
          <button className="btn btn-primary">
            Connect Bank Account
          </button>
        </div>
      </main>
    </div>
  )
}
