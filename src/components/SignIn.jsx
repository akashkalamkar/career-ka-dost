import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { btnPrimary } from '../config/ui'
import { trackEvent } from '../utils/analytics'
import { SIGN_IN_EVENT as OPEN_EVENT, requestSignIn } from '../utils/signInRequest'
import { inAppBrowser, prepareSignIn, signInEnabled, signInError, signInReady, signInWithGoogle, signOutStudent, useAuth } from '../utils/auth'

/**
 * Everything students see about "Sign in with Google":
 * - <SignInModal />: one pop-up for the whole website (mounted in App.jsx). It opens when a signed-out
 *   visitor taps a download, explains why, signs them in and then shows the real "Download now" button.
 * - <GatedDownload />: a download link that asks to sign in first (a plain link when sign-in is off).
 * - <GoogleButton />, <AccountBar />: the sign-in button and "Signed in as ... · Sign out" line.
 */


function GoogleG({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

/** "Continue with Google". Loads the sign-in library first, so the click can open Google's window at once. */
export function GoogleButton({ label = 'Continue with Google', from = 'button', className = '' }) {
  const { loading } = useAuth()
  const [ready, setReady] = useState(signInReady())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let live = true
    prepareSignIn().then((api) => live && setReady(Boolean(api)))
    return () => {
      live = false
    }
  }, [])

  function go() {
    setError('')
    setBusy(true)
    trackEvent('sign_in_start', { from })
    signInWithGoogle()
      .then(() => trackEvent('sign_in_done', { from }))
      .catch((err) => setError(signInError(err)))
      .finally(() => setBusy(false))
  }

  const waiting = !ready || busy || (loading && !ready)
  return (
    <div className={className}>
      <button
        type="button"
        onClick={go}
        disabled={waiting}
        className="inline-flex w-full items-center justify-center gap-3 border-2 border-[#dadce0] bg-white px-5 py-3 font-semibold text-[#1f1f1f] shadow-sm transition hover:bg-[#f8f9fa] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        <GoogleG className="h-5 w-5" />
        {busy ? 'Signing in...' : ready ? label : 'Loading...'}
      </button>
      {inAppBrowser() ? (
        <p className="mt-2 text-sm font-semibold text-[#8a0000]">Google sign-in does not work inside apps like Instagram. Tap the menu and choose &ldquo;Open in Chrome&rdquo; (or Safari) first.</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm font-semibold text-[#a40000]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** "Signed in as Riya (riya@gmail.com) · Sign out" */
export function AccountBar({ className = '' }) {
  const { user } = useAuth()
  if (!user) return null
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft ${className}`}>
      {user.photo ? <img src={user.photo} alt="" width={24} height={24} referrerPolicy="no-referrer" className="h-6 w-6 rounded-full" /> : null}
      <span>
        Signed in as <strong className="text-ink">{user.name || user.email}</strong>
        {user.name && user.email ? ` (${user.email})` : ''}
      </span>
      <button type="button" onClick={() => signOutStudent()} className="font-bold text-ink underline decoration-brand decoration-2 underline-offset-4">
        Sign out
      </button>
    </p>
  )
}

/**
 * A download that needs signing in. Signed in (or sign-in switched off): a normal link.
 * Signed out: tapping it opens the sign-in pop-up, which then offers the same download.
 */
export function GatedDownload({ href, download, newTab = false, label, reason, className, onDownload, children, ...rest }) {
  const { user } = useAuth()
  const open = !signInEnabled || Boolean(user)
  const linkProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a
      href={href}
      download={download}
      {...linkProps}
      {...rest}
      className={className}
      onClick={(e) => {
        if (open) {
          onDownload?.()
          return
        }
        e.preventDefault()
        trackEvent('download_needs_sign_in', { what: label })
        requestSignIn({ reason, then: { href, download, newTab, label, onDownload } })
      }}
    >
      {children}
    </a>
  )
}

export function SignInModal() {
  const [ask, setAsk] = useState(null) // { reason, then }
  const { user } = useAuth()
  const titleId = useId()
  const closeRef = useRef(null)

  useEffect(() => {
    const onAsk = (e) => setAsk(e.detail || {})
    window.addEventListener(OPEN_EVENT, onAsk)
    return () => window.removeEventListener(OPEN_EVENT, onAsk)
  }, [])

  useEffect(() => {
    if (!ask) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setAsk(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ask])

  if (!ask) return null
  const then = ask.then
  const linkProps = then && then.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" aria-label="Close" onClick={() => setAsk(null)} className="absolute inset-0 cursor-default bg-[#5c3b00]/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md border-t-8 border-brand bg-white p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-2xl font-extrabold leading-tight">
            {user ? 'You are signed in' : 'Sign in to download'}
          </h2>
          <button ref={closeRef} type="button" onClick={() => setAsk(null)} className="shrink-0 border-2 border-brand-deep bg-white px-3 py-1.5 text-sm font-bold transition hover:bg-brand">
            Close
          </button>
        </div>

        {user ? (
          <>
            <AccountBar className="mt-4" />
            {then ? (
              <a
                href={then.href}
                download={then.download}
                {...linkProps}
                onClick={() => {
                  then.onDownload?.()
                  setAsk(null)
                }}
                className={`${btnPrimary} mt-6 w-full`}
              >
                Download now{then.label ? `: ${then.label}` : ''}
              </a>
            ) : null}
          </>
        ) : (
          <>
            <p className="mt-3 leading-relaxed text-ink-soft">
              {ask.reason || 'Downloads are free for students.'} Sign in once with your Google (Gmail) account - it takes a few seconds and there is no password to create.
            </p>
            <p className="mt-2 text-sm text-mute">You can still view everything without signing in.</p>
            <GoogleButton from="download" className="mt-6" />
            <p className="mt-4 text-xs leading-relaxed text-mute">
              We only use your sign-in to give you downloads and save your checklist ticks. See our{' '}
              <a href="/privacy" className="font-semibold underline">
                privacy policy
              </a>
              .
            </p>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
