import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle'
import { api } from '../lib/api'

interface SignupPageProps {
  onSignupSuccess: (user: { id: number; email_address: string }) => void
  onSwitchToLogin: () => void
}

export default function SignupPage({ onSignupSuccess, onSwitchToLogin }: SignupPageProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsLoading(true)

    try {
      const response = await api('/user', {
        method: 'POST',
        body: { email_address: email, password, password_confirmation: passwordConfirmation },
      })

      if (response.ok) {
        const user = await response.json()
        onSignupSuccess(user)
      } else {
        const data = await response.json()
        setErrors(data.errors || [t('auth.signup.error_generic')])
      }
    } catch {
      setErrors([t('auth.signup.error_generic')])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with theme toggle */}
      <header className="flex justify-end p-6">
        <ThemeToggle />
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">
          {/* Logo / App name */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {t('auth.title')}
            </h1>
            <p className="text-sm text-text-muted">
              {t('auth.subtitle')}
            </p>
          </div>

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.length > 0 && (
              <div className="error-message" role="alert">
                {errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                {t('auth.email_label')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder={t('auth.email_placeholder')}
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
              >
                {t('auth.password_label')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder={t('auth.signup.password_placeholder')}
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password-confirmation"
                className="block text-sm font-medium mb-2"
              >
                {t('auth.signup.password_confirm_label')}
              </label>
              <input
                id="password-confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="input"
                placeholder={t('auth.signup.password_confirm_placeholder')}
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full mt-6"
            >
              {isLoading ? t('auth.signup.submitting') : t('auth.signup.submit')}
            </button>
          </form>

          {/* Switch to login */}
          <p className="text-center text-sm mt-8 text-text-muted">
            {t('auth.signup.has_account')}{' '}
            <button onClick={onSwitchToLogin} className="link">
              {t('auth.signup.sign_in_link')}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
