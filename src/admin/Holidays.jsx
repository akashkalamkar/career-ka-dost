import { useEffect, useState } from 'react'
import { btnPrimary } from '../config/ui'
import { card, dateLabel, inputClass } from './format'
import { Message } from './Shared'
import { useCaller } from './useCaller'

const explain = (message) =>
  message === 'Unknown request.' ? 'Holidays need the new Google script (portal-v14). Paste it into Apps Script and deploy a New version.' : message

/**
 * Holiday list. Every Sunday and the national holidays are automatic. The owner adds any other holiday
 * (a festival, an office closure) and can remove the ones he added; everyone else can only view.
 */
export function Holidays({ token, boot, onBoot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const today = boot.serverTime.date
  const thisYear = today.slice(0, 4)
  const [year, setYear] = useState(thisYear)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState('')

  useEffect(() => {
    let alive = true
    run('listHolidays', { year })
      .then((d) => {
        if (!alive) return
        setData(d)
        setError('')
      })
      .catch((err) => alive && setError(explain(err.message)))
    return () => {
      alive = false
    }
  }, [run, year])

  // Other tabs (the "today is a holiday" note, working days in All records) use the portal's main data,
  // so reload it after a change. A failure here is harmless: the holiday itself is already saved.
  function refreshPortal() {
    run('me')
      .then((d) => onBoot && onBoot(d))
      .catch(() => {})
  }

  async function add(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const d = await run('addHoliday', { date, name })
      setYear(d.year)
      setData(d)
      refreshPortal()
      setNotice(`${dateLabel(date)} (${name.trim()}) is now a holiday.`)
      setDate('')
      setName('')
    } catch (err) {
      setError(explain(err.message))
    } finally {
      setBusy(false)
    }
  }

  async function remove(h) {
    if (!window.confirm(`Remove the holiday on ${dateLabel(h.date)} (${h.name})? It becomes a normal working day.`)) return
    setRemoving(h.date)
    setError('')
    setNotice('')
    try {
      setData(await run('removeHoliday', { date: h.date }))
      refreshPortal()
      setNotice(`${dateLabel(h.date)} is a working day again.`)
    } catch (err) {
      setError(explain(err.message))
    } finally {
      setRemoving('')
    }
  }

  // Only show the reply for the year now selected.
  const shown = data && data.year === year ? data : null
  const years = [String(Number(thisYear) - 1), thisYear, String(Number(thisYear) + 1)]

  return (
    <div className="space-y-8">
      {shown && shown.canEdit ? (
        <form onSubmit={add} className={card}>
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">Add a holiday</h2>
          <p className="mt-2 text-ink-soft">Every Sunday and the national holidays are already holidays. Add any other day the office is closed.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">
              Date
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold">
              Holiday name
              <input type="text" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali" className={inputClass} />
            </label>
          </div>
          <button type="submit" disabled={busy} className={`${btnPrimary} mt-5 disabled:opacity-50`}>
            {busy ? 'Saving...' : 'Add holiday'}
          </button>
        </form>
      ) : null}

      <div className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Holidays</h2>
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <label className="block text-sm font-bold">
            Year
            <select value={year} onChange={(e) => setYear(e.target.value)} className={`${inputClass} !mt-1 w-36`}>
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 space-y-5">
          <Message>{error}</Message>
          <Message kind="ok">{notice}</Message>
          {!shown && !error ? <p className="font-semibold text-mute">Loading...</p> : null}
          {shown ? (
            <>
              <p className="border-l-4 border-brand bg-paper-2 px-4 py-3 font-bold">Every Sunday is a holiday.</p>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">National holidays (automatic)</p>
                <ul className="mt-2 divide-y divide-line border border-line">
                  {shown.national.map((h) => (
                    <li key={h.date} className="flex justify-between gap-4 px-4 py-3 text-sm">
                      <span className="font-semibold">{h.name}</span>
                      <span>{dateLabel(h.date)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">Other holidays in {shown.year}</p>
                {shown.custom.length ? (
                  <ul className="mt-2 divide-y divide-line border border-line">
                    {shown.custom.map((h) => (
                      <li key={h.date} className={`flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm ${h.date < today ? 'text-mute' : ''}`}>
                        <span className="font-semibold">{h.name}</span>
                        <span className="flex items-center gap-4">
                          {dateLabel(h.date)}
                          {shown.canEdit ? (
                            <button type="button" disabled={removing === h.date} onClick={() => remove(h)} className="text-xs font-extrabold text-[#a40000] underline underline-offset-4 disabled:opacity-50">
                              {removing === h.date ? 'Removing...' : 'Remove'}
                            </button>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 border border-dashed border-ink/25 px-4 py-4 text-center text-sm font-semibold text-mute">None added for {shown.year}.</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
