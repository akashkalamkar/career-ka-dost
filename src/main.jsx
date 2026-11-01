import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { currentPath, upgradeOldAddress } from './utils/router'

// Old links (careerkadost.com/#/pricing) open the same page at its new address.
upgradeOldAddress()

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// A page the build prepared ahead of time (scripts/prerender.js) is taken over as it is, without being
// drawn a second time - that second drawing is what made phones look slow to Google. Any other case
// (the staff portal, an old #/ link, an unknown address) is drawn fresh.
if (root.dataset.prerendered && root.dataset.prerendered === currentPath()) hydrateRoot(root, app)
else createRoot(root).render(app)
