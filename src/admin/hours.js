/**
 * Hours worked. Each attendance row carries the day's hours as text ("8h 05m"), filled in by the portal
 * script at check-out - so a day counts once the person has checked out, and the weekly and monthly totals
 * grow through the day as each employee checks out. Weeks run Monday to Sunday.
 */

/** "8h 05m" -> 485 (minutes). Anything else (no check-out yet) -> 0. */
export function minutesOf(hours) {
  const m = /^(\d+)h\s*(\d+)m$/.exec(String(hours || '').trim())
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}

/** 485 -> "8h 05m" */
export function hoursLabel(mins) {
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`
}

const toUtc = (date) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
const fromUtc = (dt) => dt.toISOString().slice(0, 10)

export function shiftDays(date, n) {
  const dt = toUtc(date)
  dt.setUTCDate(dt.getUTCDate() + n)
  return fromUtc(dt)
}

/** The Monday of the week that contains `date`. */
export function mondayOf(date) {
  return shiftDays(date, -((toUtc(date).getUTCDay() + 6) % 7))
}

/** The seven dates (Monday to Sunday) of the week starting on `monday`. */
export function weekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => shiftDays(monday, i))
}

/** "Mon 27" style column heading. */
export function dayHead(date) {
  return toUtc(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** "27 Oct - 2 Nov 2026" */
export function weekLabel(monday) {
  const opts = { day: 'numeric', month: 'short', timeZone: 'UTC' }
  const sunday = shiftDays(monday, 6)
  return `${toUtc(monday).toLocaleDateString('en-GB', opts)} - ${toUtc(sunday).toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`
}

/** Total minutes per username for the given rows. */
export function minutesByPerson(rows) {
  const out = {}
  for (const r of rows) out[r.username] = (out[r.username] || 0) + minutesOf(r.hours)
  return out
}
