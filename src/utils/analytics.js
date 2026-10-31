import { SITE } from '../config/site'

/**
 * Free visitor statistics with Google Analytics 4: which pages are read, where visitors come from, and
 * how many tap Book counselling, WhatsApp, Call or send the form. Switched on by SITE.gaMeasurementId;
 * nothing is loaded while it is empty, and nothing at all on the staff portal (/admin). The Google script
 * is fetched after the page has loaded, so it never slows the website down.
 */

const ID = (SITE.gaMeasurementId || '').trim()
let started = false

function gtag() {
  // Google's own snippet: it expects the `arguments` object itself, not an array.
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(arguments)
}

function start() {
  if (started) return
  started = true
  gtag('js', new Date())
  gtag('config', ID, { send_page_view: false })
  const load = () => {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID)}`
    document.head.appendChild(s)
  }
  if (document.readyState === 'complete') setTimeout(load, 1500)
  else window.addEventListener('load', () => setTimeout(load, 1500), { once: true })
  document.addEventListener('click', onClick, true)
}

const onPortal = () => window.location.pathname.startsWith('/admin')

/** Records one page view. Called by App.jsx whenever the visitor opens a page. */
export function trackPageView() {
  if (!ID || onPortal()) return
  start()
  gtag('event', 'page_view', { page_location: window.location.href, page_path: window.location.pathname, page_title: document.title })
}

/** Records one action, e.g. trackEvent('whatsapp_click'). */
export function trackEvent(name, params = {}) {
  if (!ID || onPortal() || !started) return
  gtag('event', name, { page_path: window.location.pathname, ...params })
}

/** Calls, emails and WhatsApp links anywhere on the website. */
function onClick(e) {
  const a = e.target.closest?.('a[href]')
  if (!a) return
  const href = a.getAttribute('href')
  if (href.startsWith('tel:')) trackEvent('phone_click')
  else if (href.startsWith('mailto:')) trackEvent('email_click')
  else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) trackEvent('whatsapp_click')
}
