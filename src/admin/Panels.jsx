import { useCallback, useEffect, useState } from 'react'
import { btnInk, btnPrimary } from '../config/ui'
import { CheckInTime, OnLeaveChip, StatusChip } from './Chips'
import { card, dateLabel, inputClass, time12 } from './format'
import { Message } from './Shared'
import { useCaller } from './useCaller'

function AttendanceTable({ rows, showName }) {
  if (!rows.length) return <p className="border border-dashed border-ink/25 px-4 py-6 text-center font-semibold text-mute">No records for this month yet.</p>
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Date</th>
            {showName ? <th className="px-4 py-3">Name</th> : null}
            <th className="px-4 py-3">Check-in</th>
            <th className="px-4 py-3">Check-out</th>
            <th className="px-4 py-3">Hours</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={`${r.date}-${r.username}`}>
              <td className="whitespace-nowrap px-4 py-3 font-semibold">{dateLabel(r.date)}</td>
              {showName ? <td className="px-4 py-3 font-semibold">{r.name}</td> : null}
              <td className="px-4 py-3">
                <CheckInTime rec={r} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">{r.checkOut ? time12(r.checkOut) : <span className="text-mute">-</span>}</td>
              <td className="whitespace-nowrap px-4 py-3">{r.hours || <span className="text-mute">-</span>}</td>
              <td className="px-4 py-3">
                <StatusChip status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Summary({ rows }) {
  const onTime = rows.filter((r) => r.status === 'On time').length
  const late = rows.filter((r) => r.status === 'Late').length
  return (
    <p className="text-sm font-bold">
      <span className="mr-4 inline-block bg-[#d3f0d9] px-3 py-1 text-[#0f6b2a]">{onTime} on time</span>
      <span className="inline-block bg-[#f8c9c9] px-3 py-1 text-[#a40000]">{late} late</span>
    </p>
  )
}

/** Employees: a box to write what you worked on today, submitted before you leave. The owner sees it by date. */
function TodayReport({ token, boot, onBoot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const [text, setText] = useState(boot.myReport ? boot.myReport.text : '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setOk('')
    try {
      const data = await run('submitReport', { text })
      onBoot(data)
      setOk('Saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={card}>
      <h2 className="font-display text-2xl font-extrabold">Today&rsquo;s work done</h2>
      <p className="mt-2 text-ink-soft">Write what you worked on today, then submit before you leave. Bharat Rai can see this by date.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <textarea
          required
          maxLength={4000}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you work on today? You can type, or copy and paste."
          className={`${inputClass} !h-auto resize-y`}
        />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className={`${btnPrimary} disabled:opacity-50`}>
            {busy ? 'Saving...' : boot.myReport ? "Update today's report" : "Submit today's report"}
          </button>
          {boot.myReport ? <span className="text-sm font-semibold text-mute">Last saved {boot.myReport.updatedOn}</span> : null}
        </div>
        <Message>{error}</Message>
        <Message kind="ok">{ok}</Message>
      </form>
    </div>
  )
}

/**
 * Everyone: today's check-in and check-out buttons, and your own records.
 * `boot` is the latest reply from the portal (today, this month's rows, and for the owner the team).
 */
export function MyAttendance({ token, user, boot, onBoot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const mine = useCallback((rows) => rows.filter((r) => r.username === user.username), [user.username])
  const [month, setMonth] = useState(boot.month)
  const [other, setOther] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const today = boot.today
  const rows = month === boot.month ? mine(boot.rows) : other

  async function act(action) {
    setBusy(true)
    setError('')
    try {
      onBoot(await run(action))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function checkOut() {
    if (window.confirm('Record your check-out now? You can only check out once a day.')) act('checkout')
  }

  async function changeMonth(m) {
    setMonth(m)
    if (!m || m === boot.month) return
    setError('')
    try {
      const data = await run('attendance', { month: m })
      setOther(mine(data.rows))
    } catch (err) {
      setError(err.message)
    }
  }

  const checkedIn = Boolean(today && today.checkIn)
  const checkedOut = Boolean(today && today.checkOut)

  return (
    <div className="space-y-8">
      <div className={card}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">{dateLabel(boot.serverTime.date)}</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">Hello, {user.name.split(' ')[0]}</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={`border-2 p-5 ${checkedIn ? (today.status === 'Late' ? 'border-[#a40000] bg-[#fdecec]' : 'border-[#0f6b2a] bg-[#e5f6e9]') : 'border-line bg-paper-2'}`}>
            <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">Check-in</p>
            {checkedIn ? (
              <>
                <p className={`mt-1 font-display text-3xl font-extrabold ${today.status === 'Late' ? 'text-[#a40000]' : 'text-[#0f6b2a]'}`}>{time12(today.checkIn)}</p>
                <p className="mt-2">
                  <StatusChip status={today.status} />
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm font-semibold text-ink-soft">Tap when you arrive. The time is saved automatically.</p>
                <button type="button" disabled={busy} onClick={() => act('checkin')} className={`${btnPrimary} mt-4 w-full disabled:opacity-50`}>
                  {busy ? 'Saving...' : 'Check-in done'}
                </button>
              </>
            )}
          </div>

          <div className={`border-2 p-5 ${checkedOut ? 'border-brand-deep bg-paper-2' : 'border-line bg-paper-2'}`}>
            <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">Check-out</p>
            {checkedOut ? (
              <>
                <p className="mt-1 font-display text-3xl font-extrabold">{time12(today.checkOut)}</p>
                <p className="mt-2 text-sm font-bold text-ink-soft">Worked today: {today.hours}</p>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm font-semibold text-ink-soft">{checkedIn ? 'Tap when you leave for the day.' : 'Available after you check in.'}</p>
                <button type="button" disabled={busy || !checkedIn} onClick={checkOut} className={`${btnInk} mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40`}>
                  {busy && checkedIn ? 'Saving...' : 'Check-out done'}
                </button>
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-mute">Check-in before 10:10 AM is shown in green. From 10:10 AM it is shown in red.</p>
        <div className="mt-4">
          <Message>{error}</Message>
        </div>
      </div>

      <TodayReport token={token} boot={boot} onBoot={onBoot} onAuthError={onAuthError} />

      <div className={card}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold">My attendance</h2>
            <div className="mt-2">
              <Summary rows={rows} />
            </div>
          </div>
          <label className="block text-sm font-bold">
            Month
            <input type="month" value={month} onChange={(e) => changeMonth(e.target.value)} className={`${inputClass} !mt-1 sm:w-48`} />
          </label>
        </div>
        <div className="mt-5">
          <AttendanceTable rows={rows} />
        </div>
      </div>
    </div>
  )
}

/** Owner: who has checked in today. */
export function TeamToday({ token, boot, onBoot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // The owner does not check in, so the team table lists the employees only.
  const team = boot.staff.filter((s) => s.role !== 'owner' && s.active)
  const counts = {
    onTime: team.filter((s) => s.today && s.today.status === 'On time').length,
    late: team.filter((s) => s.today && s.today.status === 'Late').length,
    leave: team.filter((s) => !s.today && s.leave).length,
    waiting: team.filter((s) => !s.today && !s.leave).length,
  }

  async function refresh() {
    setBusy(true)
    setError('')
    try {
      onBoot(await run('me'))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">{dateLabel(boot.serverTime.date)}</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">Team today</h2>
        </div>
        <button type="button" onClick={refresh} disabled={busy} className={`${btnInk} !px-5 !py-2.5 disabled:opacity-50`}>
          {busy ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="mt-4">
        <Message>{error}</Message>
      </div>
      <p className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
        <span className="bg-[#d3f0d9] px-3 py-1 text-[#0f6b2a]">{counts.onTime} on time</span>
        <span className="bg-[#f8c9c9] px-3 py-1 text-[#a40000]">{counts.late} late</span>
        <span className="bg-[#dbe9ff] px-3 py-1 text-[#0d3a8a]">{counts.leave} on leave</span>
        <span className="bg-paper-2 px-3 py-1 text-mute">{counts.waiting} not checked in yet</span>
      </p>
      <div className="mt-5 overflow-x-auto border border-line">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Check-in</th>
              <th className="px-4 py-3">Check-out</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {team.map((s) => (
              <tr key={s.username}>
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3">
                  <CheckInTime rec={s.today} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">{s.today && s.today.checkOut ? time12(s.today.checkOut) : <span className="text-mute">-</span>}</td>
                <td className="whitespace-nowrap px-4 py-3">{s.today && s.today.hours ? s.today.hours : <span className="text-mute">-</span>}</td>
                <td className="px-4 py-3">
                  {!s.today && s.leave ? <OnLeaveChip leave={s.leave} /> : <StatusChip status={s.today ? s.today.status : ''} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Owner: everyone's daily work report, by date (defaults to today). */
export function TeamReports({ token, boot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const [date, setDate] = useState(boot.serverTime.date)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    run('teamReports', { date })
      .then((d) => {
        if (!alive) return
        setData(d)
        setError('')
      })
      .catch((err) => alive && setError(err.message))
    return () => {
      alive = false
    }
  }, [date, run])

  const loaded = data && data.date === date
  const loading = !error && !loaded
  const byUser = Object.fromEntries((loaded ? data.reports : []).map((r) => [r.username, r]))
  const staff = (loaded ? data.staff : []).filter((s) => s.active)

  return (
    <div className={card}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Daily reports</h2>
        <label className="block text-sm font-bold">
          Date
          <input type="date" value={date} max={boot.serverTime.date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} !mt-1 sm:w-48`} />
        </label>
      </div>
      <div className="mt-5 space-y-4">
        <Message>{error}</Message>
        {loading ? <p className="font-semibold text-mute">Loading...</p> : null}
        {!loading && !staff.length ? <p className="border border-dashed border-ink/25 px-4 py-6 text-center font-semibold text-mute">No employees yet.</p> : null}
        {!loading
          ? staff.map((s) => {
              const r = byUser[s.username]
              return (
                <div key={s.username} className="border border-line p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-lg font-extrabold">{s.name}</p>
                    {r ? <span className="text-xs font-semibold text-mute">Saved {r.updatedOn}</span> : null}
                  </div>
                  {r ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-ink">{r.text}</p>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-mute">No report submitted for this date.</p>
                  )}
                </div>
              )
            })
          : null}
      </div>
    </div>
  )
}

/** One row per employee: how many days present, on time and late, for whichever rows are passed in. */
function summarizeByEmployee(rows, staff) {
  const map = {}
  staff.forEach((s) => {
    map[s.username] = { username: s.username, name: s.name, active: s.active, present: 0, onTime: 0, late: 0 }
  })
  rows.forEach((r) => {
    const e = map[r.username]
    if (!e) return
    e.present++
    if (r.status === 'On time') e.onTime++
    else if (r.status === 'Late') e.late++
  })
  return Object.values(map)
}

/**
 * Days in the month that are not holidays (Sundays, national and owner-added holidays), counting only up
 * to today for the current month. null when the portal script is older and sends no holiday list.
 */
function workingDays(month, holidays, today) {
  if (!Array.isArray(holidays)) return null
  const [y, m] = month.split('-').map(Number)
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const off = new Set(holidays.map((h) => h.date))
  let count = 0
  for (let d = 1; d <= days; d++) {
    const date = `${month}-${String(d).padStart(2, '0')}`
    if (date <= today && !off.has(date)) count++
  }
  return count
}

/** Owner: days present / on time / late per employee for the selected month - a quick view for reviews. */
function MonthSummary({ rows, staff, working }) {
  const list = summarizeByEmployee(
    rows,
    staff.filter((s) => s.role !== 'owner'),
  )
  if (!list.length) return null
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            {working !== null ? <th className="px-4 py-3">Working days</th> : null}
            <th className="px-4 py-3">Present</th>
            <th className="px-4 py-3">On time</th>
            <th className="px-4 py-3">Late</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {list.map((e) => (
            <tr key={e.username} className={e.active ? '' : 'bg-paper-2/60'}>
              <td className="px-4 py-3 font-semibold">
                {e.name}
                {e.active ? '' : ' (discontinued)'}
              </td>
              {working !== null ? <td className="px-4 py-3">{working}</td> : null}
              <td className="px-4 py-3">{e.present}</td>
              <td className="px-4 py-3">{e.onTime}</td>
              <td className="px-4 py-3">{e.late}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Owner: every record, by month and by person. The person filter works instantly (no waiting). */
export function AllRecords({ token, boot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const [month, setMonth] = useState(boot.month)
  const [who, setWho] = useState('')
  const [fetched, setFetched] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const all = month === boot.month ? boot.rows : fetched && fetched.month === month ? fetched.rows : []
  const holidays = month === boot.month ? boot.monthHolidays : fetched && fetched.month === month ? fetched.monthHolidays : undefined
  const working = month ? workingDays(month, holidays, boot.serverTime.date) : null
  const rows = who ? all.filter((r) => r.username === who) : all

  async function changeMonth(m) {
    setMonth(m)
    if (!m || m === boot.month) return
    setLoading(true)
    setError('')
    try {
      setFetched(await run('attendance', { month: m }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function download() {
    const head = ['Date', 'Name', 'Check-in', 'Check-out', 'Hours', 'Status']
    const lines = rows.map((r) => [r.date, r.name, r.checkIn, r.checkOut, r.hours, r.status].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','))
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `attendance-${month}${who ? `-${who}` : ''}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-8">
      <div className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Monthly summary per employee</h2>
        <p className="mt-2 text-ink-soft">
          Days present, on time and late for the month selected below - useful for reviews.
          {working !== null ? ' Working days leave out Sundays and holidays, and count only up to today.' : ''}
        </p>
        <div className="mt-5">
          <MonthSummary rows={all} staff={boot.staff} working={working} />
        </div>
      </div>

      <div className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">All attendance records</h2>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block text-sm font-bold">
            Month
            <input type="month" value={month} onChange={(e) => changeMonth(e.target.value)} className={`${inputClass} !mt-1 sm:w-48`} />
          </label>
          <label className="block text-sm font-bold">
            Person
            <select value={who} onChange={(e) => setWho(e.target.value)} className={`${inputClass} !mt-1 sm:w-64`}>
              <option value="">Everyone</option>
              {boot.staff
                .filter((s) => s.role !== 'owner')
                .map((s) => (
                  <option key={s.username} value={s.username}>
                    {s.name}
                    {s.active ? '' : ' (discontinued)'}
                  </option>
                ))}
            </select>
          </label>
          <button type="button" onClick={download} disabled={!rows.length} className={`${btnInk} !py-3 disabled:opacity-40`}>
            Download CSV
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <Message>{error}</Message>
          {loading ? <p className="font-semibold text-mute">Loading...</p> : null}
          <Summary rows={rows} />
          <AttendanceTable rows={rows} showName />
        </div>
      </div>
    </div>
  )
}

/** Owner: add employees, discontinue them (nothing is deleted), and reset passwords. */
export function StaffTab({ token, boot, onBoot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const [error, setError] = useState('')
  const [issued, setIssued] = useState(null) // temporary password after a reset
  const [added, setAdded] = useState(null) // details to hand to a new employee
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)

  async function addEmployee(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setIssued(null)
    try {
      const data = await run('addStaff', { name, username })
      onBoot(data)
      setAdded(data.added)
      setName('')
      setUsername('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function reset(s) {
    if (!window.confirm(`Reset the password for ${s.name}? Their current password will stop working.`)) return
    setError('')
    setIssued(null)
    setAdded(null)
    try {
      const r = await run('resetPassword', { username: s.username })
      setIssued({ name: r.name, username: r.username, password: r.tempPassword })
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggle(s) {
    const stopping = s.active
    const sure = stopping
      ? `Discontinue ${s.name}? They will not be able to log in. All their records stay here, and you can bring them back later.`
      : `Bring ${s.name} back? They will be able to log in again.`
    if (!window.confirm(sure)) return
    setError('')
    try {
      onBoot(await run('setActive', { username: s.username, active: !stopping }))
    } catch (err) {
      setError(err.message)
    }
  }

  const cleanName = username.trim().toLowerCase()

  return (
    <div className="space-y-8">
      <form onSubmit={addEmployee} className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Add a new employee</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Type the employee&rsquo;s name and choose their username. <strong className="text-ink">The username is fixed: it can never be changed afterwards.</strong> The first password is always the username followed by @123. At their first login the employee changes only the password.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-bold">
            Full name
            <input type="text" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold">
            Username <span className="font-semibold text-mute">(fixed, small letters, with a number, for example kalpak1484)</span>
            <input type="text" required autoCapitalize="none" spellCheck={false} maxLength={30} value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className={inputClass} />
          </label>
        </div>
        <p className="mt-3 text-sm font-semibold text-ink-soft">
          First password will be: <span className="font-extrabold text-ink">{cleanName ? `${cleanName}@123` : 'username@123'}</span>
        </p>
        <div className="mt-4 space-y-4">
          <Message>{error}</Message>
          {added ? (
            <div className="border-2 border-[#0f6b2a] bg-[#e5f6e9] p-5" role="status">
              <p className="font-bold text-[#0b4f1f]">{added.name} was added. Please give them:</p>
              <p className="mt-2 font-display text-xl font-extrabold">
                Username: <span className="select-all">{added.username}</span>
              </p>
              <p className="font-display text-xl font-extrabold">
                First password: <span className="select-all">{added.password}</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-ink-soft">At their first login they change the password. The username stays the same. Share this privately.</p>
            </div>
          ) : null}
        </div>
        <button type="submit" disabled={busy} className={`${btnPrimary} mt-4 disabled:opacity-50`}>
          {busy ? 'Adding...' : 'Add employee'}
        </button>
      </form>

      <div className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Staff</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Nobody is ever deleted. A discontinued employee cannot log in, but all their attendance and leave records stay in your records. If someone forgets their password, reset it here and give them the temporary password.
        </p>
        <div className="mt-4 space-y-4">
          {issued ? (
            <div className="border-2 border-brand-deep bg-paper-2 p-5" role="status">
              <p className="font-bold">Temporary password for {issued.name}</p>
              <p className="mt-2 select-all font-display text-3xl font-extrabold tracking-wide">{issued.password}</p>
              <p className="mt-2 text-sm font-semibold text-ink-soft">Username: {issued.username}. Share this privately. It is shown only now. They must change it at their next login.</p>
            </div>
          ) : null}
        </div>
        <div className="mt-5 overflow-x-auto border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {boot.staff.map((s) => (
                <tr key={s.username} className={s.active ? '' : 'bg-paper-2/60'}>
                  <td className="px-4 py-3 font-semibold">
                    {s.name}
                    {s.role === 'owner' ? <span className="ml-2 bg-brand px-2 py-0.5 text-[0.65rem] font-extrabold uppercase">Owner</span> : null}
                  </td>
                  <td className="px-4 py-3">{s.username}</td>
                  <td className="px-4 py-3">
                    {s.active ? (
                      <>
                        <span className="inline-block bg-[#d3f0d9] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0f6b2a]">Active</span>
                        {s.mustChange ? <span className="ml-2 inline-block bg-[#fff1c2] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#7a5200]">First password pending</span> : null}
                      </>
                    ) : (
                      <span className="inline-block bg-paper-2 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-mute">Discontinued</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{s.lastLogin || <span className="text-mute">Never</span>}</td>
                  <td className="px-4 py-3">
                    {s.role === 'owner' ? null : (
                      <div className="flex flex-wrap justify-end gap-2">
                        {s.active ? (
                          <button type="button" onClick={() => reset(s)} className={`${btnInk} !px-4 !py-2`}>
                            Reset password
                          </button>
                        ) : null}
                        <button type="button" onClick={() => toggle(s)} className={`${btnInk} !px-4 !py-2`}>
                          {s.active ? 'Discontinue' : 'Reactivate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/** Everyone: change your own password (you must know the current one). Also used for the first login. */
export function PasswordForm({ token, forced = false, onAuthError, onDone }) {
  const run = useCaller(token, onAuthError)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    if (next !== again) return setError('The two new passwords do not match.')
    setBusy(true)
    try {
      const data = await run('changePassword', { current, next })
      setCurrent('')
      setNext('')
      setAgain('')
      setOk('Your password has been changed.')
      onDone?.(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const type = show ? 'text' : 'password'
  return (
    <form onSubmit={submit} className={`${card} mx-auto max-w-lg`}>
      <h2 className="font-display text-2xl font-extrabold md:text-3xl">{forced ? 'Set your own password' : 'Change password'}</h2>
      <p className="mt-2 text-ink-soft">
        {forced
          ? 'This is your first login. Please choose a new password that only you know. Your username stays the same.'
          : 'Enter your current password, then choose a new one.'}{' '}
        Use at least 8 characters, with letters and numbers.
      </p>
      <div className="mt-5 space-y-4">
        <label className="block text-sm font-bold">
          {forced ? 'First password (the one you were given)' : 'Current password'}
          <input type={type} autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-bold">
          New password
          <input type={type} autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-bold">
          New password again
          <input type={type} autoComplete="new-password" required minLength={8} value={again} onChange={(e) => setAgain(e.target.value)} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4 accent-[#ffb81c]" />
          Show passwords
        </label>
        <Message>{error}</Message>
        <Message kind="ok">{ok}</Message>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-50`}>
          {busy ? 'Saving...' : 'Save new password'}
        </button>
      </div>
    </form>
  )
}
