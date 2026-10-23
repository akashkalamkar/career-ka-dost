import { useState } from 'react'
import { LockIcon } from '../components/icons'
import { btnInk, btnPrimary } from '../config/ui'
import { call } from './api'
import { card, inputClass } from './format'

/**
 * Forgot password. Only the owner (Bharat Rai) can reset by email:
 *   1. type the owner's username  ->  2. a 6-digit code is emailed to the company address
 *   3. type the code and a new password.
 * Employees ask Bharat Rai, who resets their password from his Staff tab. The portal answers the same way for
 * every username, so nobody can find out which username belongs to the owner.
 */
export function ForgotOwner({ onBack, onDone }) {
  const [step, setStep] = useState('who') // who -> code
  const [username, setUsername] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [code, setCode] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function attempt(work) {
    setBusy(true)
    setError('')
    try {
      await work()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const start = (e) => {
    e.preventDefault()
    return attempt(async () => {
      const data = await call('forgotStart', { username })
      setSentTo(data.sentTo)
      setCode('')
      setStep('code')
    })
  }

  const confirm = (e) => {
    e.preventDefault()
    if (next !== again) return setError('The two new passwords do not match.')
    return attempt(async () => {
      await call('forgotConfirm', { code: code.trim(), next })
      onDone()
    })
  }

  const errorBox = error ? (
    <p role="alert" className="border-l-4 border-[#a40000] bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#7a0000]">
      {error}
    </p>
  ) : null

  const back = (
    <button type="button" onClick={onBack} className={`${btnInk} w-full`}>
      Back to login
    </button>
  )

  return (
    <section className="min-h-[60svh] bg-paper-2 py-14 md:py-20">
      <div className="mx-auto w-full max-w-md px-5">
        <div className={`${card} border-t-4 border-t-brand`}>
          <span className="flex h-12 w-12 items-center justify-center bg-brand shadow-[0_4px_0_0_#b97f00]">
            <LockIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold">Forgot password</h1>

          {step === 'who' ? (
            <form onSubmit={start} className="mt-4 space-y-4">
              <p className="text-ink-soft">Type the owner&rsquo;s username. We will email a 6-digit code to the company email address.</p>
              <p className="border-l-4 border-brand bg-paper-2 px-4 py-3 text-sm font-semibold text-ink-soft">
                Only the owner (Bharat Rai) can reset a password by email. Employees: please ask Bharat Rai to reset your password from his Staff tab.
              </p>
              <label className="block text-sm font-bold">
                Username
                <input type="text" autoCapitalize="none" spellCheck={false} required value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
              </label>
              {errorBox}
              <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-50`}>
                {busy ? 'Sending...' : 'Email me a code'}
              </button>
              {back}
            </form>
          ) : (
            <form onSubmit={confirm} className="mt-4 space-y-4">
              <p className="border-l-4 border-[#0f6b2a] bg-[#e5f6e9] px-4 py-3 text-sm font-bold text-[#0b4f1f]">
                If the username is right, a 6-digit code was sent to {sentTo}. It works for 15 minutes. Please also look in Spam. If nothing arrives within a minute, check the username and try again.
              </p>
              <label className="block text-sm font-bold">
                6-digit code
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className={`${inputClass} text-center font-display text-2xl tracking-[0.4em]`}
                />
              </label>
              <label className="block text-sm font-bold">
                New password
                <input type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-bold">
                Confirm new password
                <input type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={again} onChange={(e) => setAgain(e.target.value)} className={inputClass} />
              </label>
              <p className="text-xs font-semibold text-mute">Use at least 8 characters, with letters and numbers.</p>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4 accent-[#ffb81c]" />
                Show passwords
              </label>
              {errorBox}
              <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-50`}>
                {busy ? 'Saving...' : 'Reset password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('who')
                  setError('')
                }}
                className={`${btnInk} w-full`}
              >
                Send a new code
              </button>
              {back}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
