import { useCallback, useEffect, useState } from 'react'
import { btnPrimary, container } from '../config/ui'
import { LockIcon } from '../components/icons'
import { AuthError, call, portalConfigured, readSession, saveSession, warmUp } from './api'
import { card, inputClass } from './format'
import { ForgotOwner } from './Forgot'
import { ApplyLeave, LeaveRequests } from './Leaves'
import { GenerateBill, InvoiceLog } from './Invoice'
import { AllRecords, MyAttendance, PasswordForm, StaffTab, TeamReports, TeamToday } from './Panels'

const isFullReply = (data) => Array.isArray(data.rows) && Array.isArray(data.leaves)

const OUT_OF_DATE =
  'The portal script on Google is an older version. Open it in Apps Script and use Deploy > Manage deployments > pencil > New version > Deploy, then try again.'

/** Keeps the staff pages out of search engines. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
}

function Shell({ children }) {
  return (
    <section className="min-h-[60svh] bg-paper-2 py-14 print:min-h-0 print:bg-white print:py-0 md:py-20">
      <div className={container}>{children}</div>
    </section>
  )
}

function NotConnected() {
  return (
    <Shell>
      <div className={`${card} mx-auto max-w-xl`}>
        <h1 className="font-display text-2xl font-extrabold">Staff portal is not connected yet</h1>
        <p className="mt-3 text-ink-soft">
          The website still needs the portal address. Set <code className="font-bold">VITE_ADMIN_API_URL</code> in the .env file (see the README, &ldquo;Staff portal&rdquo;), then rebuild the website.
        </p>
      </div>
    </Shell>
  )
}

function Login({ onLoggedIn, onForgot, notice }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Wake the portal up while the person is still typing, so the Log in button answers quickly.
  useEffect(() => {
    warmUp()
  }, [])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await call('login', { username, password })
      if (!data.user.mustChange && !isFullReply(data)) throw new Error(OUT_OF_DATE)
      onLoggedIn(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell>
      <form onSubmit={submit} className={`${card} mx-auto max-w-md border-t-4 border-t-brand`}>
        <span className="flex h-12 w-12 items-center justify-center bg-brand shadow-[0_4px_0_0_#b97f00]">
          <LockIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">Staff login</h1>
        <p className="mt-2 text-ink-soft">For Career Ka Dost team members only.</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold">
            Username
            <input
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-bold">
            Password
            <input type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4 accent-[#ffb81c]" />
            Show password
          </label>
          {notice ? (
            <p role="status" className="border-l-4 border-[#0f6b2a] bg-[#e5f6e9] px-4 py-3 text-sm font-bold text-[#0b4f1f]">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="border-l-4 border-[#a40000] bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#7a0000]">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-50`}>
            {busy ? 'Logging in...' : 'Log in'}
          </button>
          <button type="button" onClick={onForgot} className="text-sm font-bold text-brass underline underline-offset-4 hover:text-ink">
            Forgot password?
          </button>
        </div>
      </form>
    </Shell>
  )
}

const tabClass = (on) =>
  `border-2 px-5 py-2.5 text-sm font-extrabold transition hover:-translate-y-0.5 ${on ? 'border-brand-deep bg-brand' : 'border-ink/15 bg-white hover:border-brand-deep'}`

function Dashboard({ session, boot, onBoot, onSignOut }) {
  const { token, user } = session
  const isOwner = user.role === 'owner'
  // The owner does not check in or out. He sees the team, the leave requests and the records.
  const pending = boot.pendingLeaves || 0
  const tabs = isOwner
    ? [
        { id: 'team', label: 'Team today' },
        { id: 'reports', label: 'Daily reports' },
        { id: 'leaves', label: pending ? `Leave requests (${pending})` : 'Leave requests' },
        { id: 'records', label: 'All records' },
        { id: 'billing', label: 'Generate bill' },
        { id: 'invoices', label: 'All invoices' },
        { id: 'staff', label: 'Staff' },
        { id: 'password', label: 'Change password' },
      ]
    : [
        { id: 'me', label: 'My attendance' },
        { id: 'leave', label: 'Apply for leave' },
        { id: 'billing', label: 'Generate bill' },
        { id: 'invoices', label: 'My invoices' },
        { id: 'password', label: 'Change password' },
      ]
  const [tab, setTab] = useState(isOwner ? 'team' : 'me')

  return (
    <Shell>
      <div className="mb-8 flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">{isOwner ? 'Owner' : 'Staff'} portal</p>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">{user.name}</h1>
        </div>
        <button type="button" onClick={onSignOut} className="self-start border-2 border-brand-deep bg-white px-5 py-2.5 text-sm font-extrabold transition hover:bg-brand sm:self-auto">
          Log out
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-3 print:hidden" role="tablist" aria-label="Portal sections">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={tabClass(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'me' ? <MyAttendance token={token} user={user} boot={boot} onBoot={onBoot} onAuthError={onSignOut} /> : null}
      {tab === 'leave' ? <ApplyLeave token={token} boot={boot} onBoot={onBoot} onAuthError={onSignOut} /> : null}
      {tab === 'leaves' ? <LeaveRequests token={token} boot={boot} onBoot={onBoot} onAuthError={onSignOut} /> : null}
      {tab === 'team' ? <TeamToday token={token} boot={boot} onBoot={onBoot} onAuthError={onSignOut} /> : null}
      {tab === 'reports' ? <TeamReports token={token} boot={boot} onAuthError={onSignOut} /> : null}
      {tab === 'records' ? <AllRecords token={token} boot={boot} onAuthError={onSignOut} /> : null}
      {tab === 'billing' ? <GenerateBill token={token} onAuthError={onSignOut} /> : null}
      {tab === 'invoices' ? <InvoiceLog token={token} onAuthError={onSignOut} /> : null}
      {tab === 'staff' ? <StaffTab token={token} boot={boot} onBoot={onBoot} onAuthError={onSignOut} /> : null}
      {tab === 'password' ? <PasswordForm token={token} onAuthError={onSignOut} /> : null}
    </Shell>
  )
}

export function AdminApp() {
  useNoIndex()
  const [session, setSession] = useState(readSession)
  const [boot, setBoot] = useState(null) // the latest reply from the portal
  const [loadError, setLoadError] = useState('')
  const [retries, setRetries] = useState(0)
  const [view, setView] = useState('login') // login | forgot
  const [notice, setNotice] = useState('')

  const update = useCallback((next) => {
    saveSession(next)
    setSession(next)
  }, [])

  const signOut = useCallback(() => {
    const current = readSession()
    if (current) call('logout', {}, current.token).catch(() => {})
    update(null)
    setBoot(null)
  }, [update])

  function onLoggedIn(data) {
    update({ token: data.token, user: data.user })
    // After a normal login everything for the first screen is already in the reply.
    if (!data.user.mustChange) setBoot(data)
  }

  // Opening the page again (or finishing the first password change): fetch the screen data once.
  const needsData = Boolean(session && !session.user.mustChange && !boot)
  useEffect(() => {
    if (!needsData) return undefined
    let alive = true
    call('me', {}, session.token)
      .then((data) => {
        if (!alive) return
        if (isFullReply(data)) setBoot(data)
        else setLoadError(OUT_OF_DATE)
      })
      .catch((err) => {
        if (!alive) return
        if (err instanceof AuthError) signOut()
        else setLoadError(err.message)
      })
    return () => {
      alive = false
    }
  }, [needsData, session, signOut, retries])

  if (!portalConfigured) return <NotConnected />
  if (!session && view === 'forgot') {
    return (
      <ForgotOwner
        onBack={() => setView('login')}
        onDone={() => {
          setNotice('Your password was changed. Please log in with the new password.')
          setView('login')
        }}
      />
    )
  }
  if (!session) {
    return (
      <Login
        notice={notice}
        onForgot={() => {
          setNotice('')
          setView('forgot')
        }}
        onLoggedIn={(data) => {
          setNotice('')
          onLoggedIn(data)
        }}
      />
    )
  }

  if (session.user.mustChange) {
    return (
      <Shell>
        <PasswordForm forced token={session.token} onAuthError={signOut} onDone={() => update({ ...session, user: { ...session.user, mustChange: false } })} />
      </Shell>
    )
  }

  if (!boot) {
    return (
      <Shell>
        <div className={`${card} mx-auto max-w-md text-center`}>
          {loadError ? (
            <>
              <p className="font-bold text-[#7a0000]">{loadError}</p>
              <button
                type="button"
                className={`${btnPrimary} mt-4`}
                onClick={() => {
                  setLoadError('')
                  setRetries((n) => n + 1)
                }}
              >
                Try again
              </button>
            </>
          ) : (
            <p className="font-semibold text-ink-soft">Loading your portal...</p>
          )}
        </div>
      </Shell>
    )
  }

  return <Dashboard session={session} boot={boot} onBoot={setBoot} onSignOut={signOut} />
}
