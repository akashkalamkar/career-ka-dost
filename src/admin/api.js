/**
 * Talks to the staff portal backend (Google Apps Script, see scripts/staff-portal-google-apps-script.gs).
 * The address comes from VITE_ADMIN_API_URL in the .env file.
 */
const API = import.meta.env.VITE_ADMIN_API_URL

export const portalConfigured = Boolean(API)

const SESSION_KEY = 'ckd-staff-session'

export function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* private window: the visit still works, but a refresh will ask for the login again */
  }
}

/** Marks errors that mean "log in again". */
export class AuthError extends Error {}

export async function call(action, payload = {}, token) {
  let data
  try {
    // text/plain keeps this a "simple" request, so Google's server accepts it from any website without a pre-check.
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token, ...payload }),
    })
    data = await res.json()
  } catch {
    throw new Error('Could not reach the portal. Please check your internet and try again.')
  }
  if (!data.ok) {
    const message = data.error || 'Something went wrong. Please try again.'
    if (/session expired|please log in/i.test(message)) throw new AuthError(message)
    throw new Error(message)
  }
  return data
}

/** A harmless request that wakes the portal up (Google puts idle scripts to sleep). Errors are ignored. */
export function warmUp() {
  if (API) fetch(API).catch(() => {})
}

let lastWarm = 0

/** Same, but at most once a minute, so it can be called on every tab switch. */
export function warmUpSoon() {
  const now = Date.now()
  if (now - lastWarm < 60000) return
  lastWarm = now
  warmUp()
}
