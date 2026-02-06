import '../styles/application.css'
import '../lib/i18n'
import { createRoot } from 'react-dom/client'
import App from '../components/App'

const container = document.getElementById('react-app')
if (container) {
  createRoot(container).render(<App />)
}
