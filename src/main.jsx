import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { upgradeOldAddress } from './utils/router'

// Old links (careerkadost.com/#/pricing) open the same page at its new address.
upgradeOldAddress()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
