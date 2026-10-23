import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { btnInk, btnPrimary } from '../config/ui'
import { AuthError, call } from './api'
import { LeaveChip } from './Chips'
import { card, dateLabel, inputClass } from './format'

function useCaller(token, onAuthError) {
  return useCallback(
    async (action, payload) => {
      try {
        return await call(action, payload, token)
      } catch (err) {
        if (err instanceof AuthError) onAuthError()
        throw err
      }
    },
    [token, onAuthError],
  )
}

const dayWord = (n) => `${n} ${n === 1 ? 'day' : 'days'}`

/** "Mon, 21 Oct 2026" or "Mon, 21 Oct 2026 to Tue, 22 Oct 2026" */
function leaveDates(l) {
  return l.from === l.to ? dateLabel(l.from) : `${dateLabel(l.from)} to ${dateLabel(l.to)}`
}

const leaveKind = (l) => (l.type === 'Half day' ? `Half day (${l.half})` : 'Full day')

/** Leave days that were accepted (the owner's yearly record per person). */
const acceptedDays = (leaves) => leaves.filter((l) => l.status === 'Accepted').reduce((sum, l) => sum + l.days, 0)

/** The "Leave applied" pop-up. */
function AppliedDialog({ leave, onClose }) {
  const okRef = useRef(null)
  useEffect(() => {
    okRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Leave applied">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#5c3b00]/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md border-t-4 border-t-[#0f6b2a] bg-white p-7 text-center shadow-2xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center bg-[#d3f0d9] text-[#0f6b2a]">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold">Leave applied</h2>
        <p className="mt-2 font-semibold text-ink-soft">Your request has been sent to Bharat Rai.</p>
        <div className="mt-4 space-y-1 border border-line bg-paper-2 p-4 text-left text-sm font-bold">
          <p>{leaveKind(leave)}</p>
          <p>{leaveDates(leave)}</p>
          <p>{dayWord(leave.days)}</p>
          <p className="pt-1">
            Status: <LeaveChip status={leave.status} />
          </p>
        </div>
        <button ref={okRef} type="button" onClick={onClose} className={`${btnPrimary} mt-5 w-full`}>
          OK
        </button>
      </div>
    </div>
  )
}

/** Employee: apply for leave, and see every request with its status. */
export function ApplyLeave({ token, boot, onBoot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const today = boot.serverTime.date
  const [type, setType] = useState('full')
  const [half, setHalf] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [applied, setApplied] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!from) return setError('Please choose the date from the calendar.')
    if (type === 'half' && !half) return setError('Please choose First half or Second half.')
    setBusy(true)
    try {
      const data = await run('applyLeave', { type, half: type === 'half' ? half : '', from, to: type === 'full' ? to || from : from, reason })
      onBoot(data)
      setApplied(data.applied)
      setFrom('')
      setTo('')
      setHalf('')
      setReason('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function cancel(l) {
    if (!window.confirm('Cancel this leave request?')) return
    setError('')
    try {
      onBoot(await run('cancelLeave', { id: l.id }))
    } catch (err) {
      setError(err.message)
    }
  }

  const choice = (on) =>
    `flex cursor-pointer items-center gap-3 border-2 px-4 py-3 font-bold transition ${on ? 'border-brand-deep bg-brand' : 'border-ink/15 bg-white hover:border-brand-deep'}`

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Apply for leave</h2>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold">Leave type</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className={choice(type === 'full')}>
              <input type="radio" name="type" checked={type === 'full'} onChange={() => setType('full')} className="h-4 w-4 accent-[#ffb81c]" />
              Full day
            </label>
            <label className={choice(type === 'half')}>
              <input type="radio" name="type" checked={type === 'half'} onChange={() => setType('half')} className="h-4 w-4 accent-[#ffb81c]" />
              Half day
            </label>
          </div>
        </fieldset>

        {type === 'half' ? (
          <fieldset className="mt-5">
            <legend className="text-sm font-bold">Which half?</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {['First half', 'Second half'].map((h) => (
                <label key={h} className={choice(half === h)}>
                  <input type="radio" name="half" checked={half === h} onChange={() => setHalf(h)} className="h-4 w-4 accent-[#ffb81c]" />
                  {h}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            {type === 'half' ? 'Date' : 'From'}
            <input type="date" required min={today} value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </label>
          {type === 'full' ? (
            <label className="block text-sm font-bold">
              To <span className="font-semibold text-mute">(same day if left empty)</span>
              <input type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
            </label>
          ) : null}
        </div>

        <label className="mt-5 block text-sm font-bold">
          Reason for leave
          <textarea
            required
            rows={4}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please write why you need this leave"
            className="mt-2 block w-full rounded-lg border border-ink/25 bg-white px-4 py-3 text-base outline-none transition hover:border-brand-deep focus:border-brand-deep focus:ring-4 focus:ring-brand/30"
          />
        </label>

        {error ? (
          <p role="alert" className="mt-4 border-l-4 border-[#a40000] bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#7a0000]">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className={`${btnPrimary} mt-5 w-full sm:w-auto disabled:opacity-50`}>
          {busy ? 'Sending...' : 'Apply'}
        </button>
      </form>

      <div className={card}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">My leave requests</h2>
          <p className="text-sm font-bold text-ink-soft">Leave taken this year: {dayWord(acceptedDays(boot.leaves))}</p>
        </div>
        {boot.leaves.length ? (
          <div className="mt-5 overflow-x-auto border border-line">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {boot.leaves.map((l) => (
                  <tr key={l.id} className="align-top">
                    <td className="px-4 py-3 font-semibold">{leaveDates(l)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{leaveKind(l)}</td>
                    <td className="px-4 py-3">{l.days}</td>
                    <td className="max-w-[16rem] px-4 py-3 text-ink-soft">{l.reason}</td>
                    <td className="px-4 py-3">
                      <LeaveChip status={l.status} />
                      {l.decidedBy && l.status !== 'Cancelled' ? <p className="mt-1 text-xs font-semibold text-mute">by {l.decidedBy}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {l.status === 'Pending' ? (
                        <button type="button" onClick={() => cancel(l)} className={`${btnInk} !px-4 !py-2`}>
                          Cancel
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 border border-dashed border-ink/25 px-4 py-6 text-center font-semibold text-mute">You have not applied for any leave yet.</p>
        )}
      </div>

      {applied ? <AppliedDialog leave={applied} onClose={() => setApplied(null)} /> : null}
    </div>
  )
}

/** Owner: read every request, accept or reject, and keep the yearly record per employee. */
export function LeaveRequests({ token, boot, onBoot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const employees = useMemo(() => boot.staff.filter((s) => s.role !== 'owner'), [boot.staff])
  const [status, setStatus] = useState(boot.pendingLeaves > 0 ? 'Pending' : 'All')
  const [who, setWho] = useState('')
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  const shown = boot.leaves.filter((l) => (status === 'All' || l.status === status) && (!who || l.username === who))

  async function decide(l, decision) {
    setBusyId(l.id)
    setError('')
    try {
      onBoot(await run('decideLeave', { id: l.id, decision }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId('')
    }
  }

  const accept = 'bg-[#0f6b2a] text-white hover:bg-[#0b5420]'
  const reject = 'bg-[#a40000] text-white hover:bg-[#860000]'

  return (
    <div className="space-y-8">
      <div className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Leave record, {boot.month.slice(0, 4)}</h2>
        <div className="mt-5 overflow-x-auto border border-line">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Leave taken (accepted)</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Rejected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {employees.map((s) => {
                const mine = boot.leaves.filter((l) => l.username === s.username)
                return (
                  <tr key={s.username}>
                    <td className="px-4 py-3 font-semibold">
                      {s.name}
                      {s.active ? null : <span className="ml-2 bg-paper-2 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase text-mute">Discontinued</span>}
                    </td>
                    <td className="px-4 py-3 font-bold">{dayWord(acceptedDays(mine))}</td>
                    <td className="px-4 py-3">{mine.filter((l) => l.status === 'Pending').length}</td>
                    <td className="px-4 py-3">{mine.filter((l) => l.status === 'Rejected').length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Leave requests</h2>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block text-sm font-bold">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} !mt-1 sm:w-48`}>
              {['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Person
            <select value={who} onChange={(e) => setWho(e.target.value)} className={`${inputClass} !mt-1 sm:w-64`}>
              <option value="">Everyone</option>
              {employees.map((s) => (
                <option key={s.username} value={s.username}>
                  {s.name}
                  {s.active ? '' : ' (discontinued)'}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p role="alert" className="mt-4 border-l-4 border-[#a40000] bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#7a0000]">
            {error}
          </p>
        ) : null}

        <ul className="mt-5 space-y-4">
          {shown.length ? (
            shown.map((l) => (
              <li key={l.id} className="border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-extrabold">{l.name}</p>
                    <p className="mt-1 font-bold">
                      {leaveKind(l)} &middot; {dayWord(l.days)}
                    </p>
                    <p className="text-sm font-semibold text-ink-soft">{leaveDates(l)}</p>
                  </div>
                  <LeaveChip status={l.status} />
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-brass">Reason</p>
                <p className="mt-1 whitespace-pre-wrap border-l-4 border-brand bg-paper-2 px-4 py-3 text-ink">{l.reason}</p>
                <p className="mt-3 text-xs font-semibold text-mute">
                  Applied on {l.appliedOn}
                  {l.decidedBy ? ` | ${l.status === 'Cancelled' ? 'Cancelled' : l.status} by ${l.decidedBy} on ${l.decidedOn}` : ''}
                </p>
                {l.status !== 'Cancelled' ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {l.status !== 'Accepted' ? (
                      <button type="button" disabled={busyId === l.id} onClick={() => decide(l, 'Accepted')} className={`px-6 py-2.5 text-sm font-extrabold transition disabled:opacity-50 ${accept}`}>
                        {l.status === 'Rejected' ? 'Change to Accept' : 'Accept'}
                      </button>
                    ) : null}
                    {l.status !== 'Rejected' ? (
                      <button type="button" disabled={busyId === l.id} onClick={() => decide(l, 'Rejected')} className={`px-6 py-2.5 text-sm font-extrabold transition disabled:opacity-50 ${reject}`}>
                        {l.status === 'Accepted' ? 'Change to Reject' : 'Reject'}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))
          ) : (
            <li className="border border-dashed border-ink/25 px-4 py-6 text-center font-semibold text-mute">No leave requests here.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
