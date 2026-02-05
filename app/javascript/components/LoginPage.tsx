import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { api } from '../lib/api'

interface LoginPageProps {
  onLoginSuccess: (user: { id: number; email_address: string }) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api('/session', {
        method: 'POST',
        body: { email_address: email, password },
      })

      if (response.ok) {
        const user = await response.json()
        onLoginSuccess(user)
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid email or password')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Header with theme toggle */}
      <header className="flex justify-end p-6">
        <ThemeToggle />
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">
          {/* Logo / App name */}
          <div className="mb-12 text-center">
            <h1
              className="text-4xl font-bold tracking-tight mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              BudgetBuddy
            </h1>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Your finances, your server, your data.
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full mt-6"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer note */}
          <p
            className="text-center text-sm mt-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Self-hosted finance tracking.{' '}
            <a
              href="https://github.com/moguls753/budgetbuddy"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              View source
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
