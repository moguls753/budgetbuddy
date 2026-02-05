import '../styles/application.css'
import { createRoot } from 'react-dom/client'
import App from '../components/App'

const container = document.getElementById('react-app')
if (container) {
  createRoot(container).render(<App />)
}
