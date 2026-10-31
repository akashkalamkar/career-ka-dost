import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { OPEN_LEAD_EVENT } from '../utils/leadForm'
import { LeadCard } from './LeadCard'

const STORAGE_KEY = 'ckd_lead_gate_done'

function readDismissed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function persistDismissed() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

/**
 * The booking form as a pop-up. It opens by itself on a visitor's first visit, and any
 * "Book counselling" button opens it again. It shows exactly the same form card as the Contact page.
 */
export function LeadGateModal() {
  const titleId = useId()
  const closeRef = useRef(null)
  // The staff login page never shows the visitor pop-up on its own.
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && !readDismissed() && !window.location.pathname.startsWith('/admin'))
  const [session, setSession] = useState(0)

  const dismiss = useCallback(() => {
    persistDismissed()
    setOpen(false)
  }, [])

  useEffect(() => {
    function onOpen() {
      setSession((n) => n + 1)
      setOpen(true)
    }
    window.addEventListener(OPEN_LEAD_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_LEAD_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain p-3 sm:items-center sm:p-6"
      role="presentation"
    >
      <button type="button" className="fixed inset-0 bg-[#5c3b00]/40 backdrop-blur-sm" aria-label="Close dialog" onClick={dismiss} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-[101] my-auto w-full max-w-2xl">
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
        <LeadCard key={session} source="lead-modal" idPrefix="gate-" titleId={titleId} onSubmitted={persistDismissed} onClose={dismiss} />
      </div>
    </div>,
    document.body,
  )
}
