import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '../components/App'

const container = document.getElementById('react-app')
if (container) {
  createRoot(container).render(<App />)
}
