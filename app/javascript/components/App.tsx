import { useState, useEffect } from 'react'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'
import { api } from '../lib/api'

type User = { id: number; email_address: string } | null

export default function App() {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api('/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch {
        // Not logged in, that's fine
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Show loading while checking auth (prevents flash of login page)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-text-muted">
          Loading...
        </div>
      </div>
    )
  }

  // Show login or dashboard based on auth state
  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />
}
