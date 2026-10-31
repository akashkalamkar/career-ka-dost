import { SITE } from '../config/site'

/**
 * The public "Total visits" counter, kept in a free Firebase Realtime Database (no Firebase library
 * needed - it is used through its plain web address). Every time someone opens the website in a new tab
 * or window, the total goes up by one; moving between pages or refreshing in the same tab does not add
 * more. Staff using the portal (/admin) and search-engine robots are not counted. The database's own
 * rules (see HANDOFF.md) only allow "add one", so nobody can set the number to anything else.
 */

const DB = (SITE.visitCounterDbUrl || '').trim().replace(/\/+$/, '')
const TOTAL_URL = `${DB}/visits/total.json`
const COUNTED_KEY = 'ckd_visit_counted'
const ROBOT = /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp/i

export const visitCounterOn = Boolean(DB)

export function countThisVisit() {
  if (!DB || window.location.pathname.startsWith('/admin') || ROBOT.test(navigator.userAgent)) return
  try {
    if (sessionStorage.getItem(COUNTED_KEY)) return
    sessionStorage.setItem(COUNTED_KEY, '1')
  } catch {
    return // storage blocked (rare private modes): skip rather than count every page change
  }
  fetch(TOTAL_URL, {
    method: 'PUT',
    body: JSON.stringify({ '.sv': { increment: 1 } }),
    keepalive: true,
  }).catch(() => {})
}

/**
 * Calls onTotal(number) now and every time the total changes, live. Returns a function that stops it.
 * The live connection is closed while the tab is in the background (the free plan allows 100 at once)
 * and reopened when the visitor comes back.
 */
export function watchTotal(onTotal) {
  if (!DB || typeof EventSource === 'undefined') return () => {}
  let source = null
  const open = () => {
    if (source) return
    source = new EventSource(TOTAL_URL)
    source.addEventListener('put', (e) => {
      try {
        const { data } = JSON.parse(e.data)
        if (typeof data === 'number') onTotal(data)
      } catch {
        // ignore a malformed message; the next one will carry the total
      }
    })
    // Firebase refused the connection (e.g. database rules not set up yet): stop quietly.
    source.addEventListener('cancel', close)
  }
  const close = () => {
    source?.close()
    source = null
  }
  const onVisibility = () => (document.hidden ? close() : open())
  if (!document.hidden) open()
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
    close()
  }
}
