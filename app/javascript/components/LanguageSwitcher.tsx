import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex gap-2">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`btn text-sm ${i18n.language === code ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '0.5rem 1rem' }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
