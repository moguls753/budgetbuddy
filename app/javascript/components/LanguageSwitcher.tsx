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
          className={i18n.language === code ? 'btn btn-primary' : 'btn btn-ghost'}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
