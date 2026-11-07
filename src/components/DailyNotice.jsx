import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { trackEvent } from '../utils/analytics'

/**
 * The hanging "Daily Notice" sign in the header and its pop-up (opened in document.body, outside the header). The daily notice routines save their PDF into Google
 * Drive > "CKD Daily Notices"; the portal script lists that folder ('notices' action, no login), newest
 * first. The pop-up shows the newest PDF with View and Download, and every older one below it - nothing
 * is ever removed. The list is fetched only when someone opens the pop-up.
 */

const API = import.meta.env.VITE_ADMIN_API_URL

const viewUrl = (id) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`
const downloadUrl = (id) => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`

/** "NEET_UG_2026_Notices_31-10-2026_5-15PM.pdf" -> "NEET UG 2026 Notices 31-10-2026 5-15PM" */
const titleOf = (name) => name.replace(/\.pdf$/i, '').replace(/_/g, ' ')

/** "2026-10-31 17:20" -> "31/10/2026, 5:20 PM" */
function when(created) {
  const [d, t] = created.split(' ')
  const [y, m, day] = d.split('-')
  const [h, min] = t.split(':').map(Number)
  return `${day}/${m}/${y}, ${h % 12 || 12}:${String(min).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

/** The hanging "Daily Notice" sign (yellow board on a pin), drawn here (no image file). It swings gently. */
function NoticeSign({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M27 33 50 9 73 33" fill="none" stroke="#13233f" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="50" cy="9" r="5" fill="#13233f" />
      <rect x="9" y="32" width="80" height="50" rx="8" fill="none" stroke="#13233f" strokeWidth="2" />
      <path d="M20 29h66a7 7 0 0 1 7 7v34a7 7 0 0 1-7 7H71l-9 16-1-16H20a7 7 0 0 1-7-7V36a7 7 0 0 1 7-7Z" fill="#ffbd17" />
      <text x="53" y="50" textAnchor="middle" fontSize="14" fontWeight="900" fill="#d40000" letterSpacing="1">
        DAILY
      </text>
      <text x="53" y="69" textAnchor="middle" fontSize="17" fontWeight="900" fill="#13233f">
        NOTICE
      </text>
    </svg>
  )
}

function Links({ id, compact }) {
  const cls = compact
    ? 'font-bold underline decoration-brand decoration-2 underline-offset-4 hover:text-brass'
    : 'inline-flex flex-1 items-center justify-center border-2 px-5 py-2.5 text-sm font-extrabold transition hover:-translate-y-0.5'
  return (
    <>
      <a href={viewUrl(id)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('notice_view')} className={compact ? cls : `${cls} border-[#c40000] bg-white text-[#c40000]`}>
        View
      </a>
      <a href={downloadUrl(id)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('notice_download')} className={compact ? cls : `${cls} border-[#c40000] bg-[#c40000] text-white`}>
        Download PDF
      </a>
    </>
  )
}

export function DailyNotice({ path }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState({ status: 'idle', notices: [] })
  const closeRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  async function show() {
    setOpen(true)
    trackEvent('daily_notice_open')
    if (state.status === 'ready' || state.status === 'loading') return
    setState({ status: 'loading', notices: [] })
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'notices' }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)
      setState({ status: 'ready', notices: data.notices || [] })
    } catch {
      setState({ status: 'error', notices: [] })
    }
  }

  // Not on the staff portal, and not when the website was built without the portal link.
  if (!API || path === '/admin') return null
  const [latest, ...older] = state.notices

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label="Daily Notice: latest NEET UG notices PDF"
        title="Daily Notice"
        className="absolute right-1 top-full -mt-3 h-16 w-16 shrink-0 print:hidden sm:static sm:-my-4 sm:h-[4.5rem] sm:w-[4.5rem]"
      >
        {/* On phones the sign hangs from the bottom edge of the header, so nothing in the header gets smaller. */}
        <NoticeSign className="ckd-swing h-full w-full drop-shadow-[0_4px_6px_rgba(19,35,63,0.25)]" />
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 cursor-default bg-[#5c3b00]/40 backdrop-blur-sm" />
              <div className="relative max-h-[88svh] w-full max-w-lg overflow-y-auto border-t-8 border-[#c40000] bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 p-6 pb-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#c40000]">Daily notice</p>
                    <h2 id={titleId} className="mt-1 font-display text-2xl font-extrabold leading-tight">
                      NEET UG 2026 – Maharashtra CET Cell notices
                    </h2>
                  </div>
                  <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="shrink-0 border-2 border-brand-deep bg-white px-4 py-2 text-sm font-bold transition hover:bg-brand">
                    Close
                  </button>
                </div>

                <div className="space-y-6 p-6 pt-3">
                  {state.status === 'loading' || state.status === 'idle' ? <p className="font-semibold text-mute">Loading the latest notice...</p> : null}
                  {state.status === 'error' ? <p className="font-semibold text-[#a40000]">Could not load the notices just now. Please try again in a minute.</p> : null}
                  {state.status === 'ready' && !latest ? <p className="font-semibold text-mute">Today&rsquo;s notice will appear here soon.</p> : null}

                  {latest ? (
                    <div className="border-2 border-[#c40000] bg-[#fff4f4] p-5">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-[#c40000]">Latest</p>
                      <p className="mt-1 font-display text-lg font-extrabold leading-snug">{titleOf(latest.name)}</p>
                      <p className="mt-1 text-sm font-semibold text-ink-soft">Updated {when(latest.created)}</p>
                      <div className="mt-4 flex gap-3">
                        <Links id={latest.id} />
                      </div>
                    </div>
                  ) : null}

                  {older.length ? (
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em]">Previous notices</p>
                      <ul className="mt-3 divide-y divide-line border-y border-line">
                        {older.map((n) => (
                          <li key={n.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-semibold">
                              {titleOf(n.name)}
                              <span className="block text-xs font-medium text-mute">{when(n.created)}</span>
                            </span>
                            <span className="flex shrink-0 gap-4">
                              <Links id={n.id} compact />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
