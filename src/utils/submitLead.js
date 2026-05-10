/**
 * Sends lead data to Google Sheets via a Google Apps Script Web App URL.
 * Uses `sendBeacon` first (reliable POST body to script.google.com), then iframe form fallback.
 *
 * Set `VITE_LEADS_WEBHOOK_URL` in `.env` (restart `npm run dev`). See `scripts/leads-google-apps-script.gs`.
 *
 * @param {{
 *   source: 'lead-form' | 'lead-modal'
 *   studentName: string
 *   phone: string
 *   email: string
 *   classExam: string
 *   city: string
 * }} payload
 */
const IFRAME_NAME = 'ckd-leads-webhook'

export function submitLead(payload) {
  const url = import.meta.env.VITE_LEADS_WEBHOOK_URL
  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url.trim())) {
    if (import.meta.env.DEV) {
      console.warn('[leads] Set VITE_LEADS_WEBHOOK_URL in .env and restart the dev server.')
    }
    return
  }

  const action = url.trim()

  const fields = {
    source: payload.source,
    studentName: payload.studentName,
    phone: payload.phone,
    email: payload.email,
    classExam: payload.classExam,
    city: payload.city,
    submittedAt: new Date().toISOString(),
  }

  const encoded = new URLSearchParams(fields).toString()

  try {
    const blob = new Blob([encoded], { type: 'application/x-www-form-urlencoded;charset=UTF-8' })
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(action, blob)) {
      return
    }
  } catch {
    /* fall through */
  }

  let iframe = document.querySelector(`iframe[name="${IFRAME_NAME}"]`)
  if (!iframe) {
    iframe = document.createElement('iframe')
    iframe.name = IFRAME_NAME
    iframe.title = 'Lead submission'
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden'
    document.body.appendChild(iframe)
  }

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action
  form.target = IFRAME_NAME
  form.acceptCharset = 'UTF-8'
  form.style.display = 'none'
  form.setAttribute('enctype', 'application/x-www-form-urlencoded')

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = String(value ?? '')
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()

  setTimeout(() => {
    form.remove()
  }, 8000)
}
