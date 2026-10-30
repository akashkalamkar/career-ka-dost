/** "13:05:09" -> "1:05:09 PM" */
export function time12(t) {
  if (!t) return '-'
  const [h, m, s] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}:${String(s || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

/** "2026-10-19" -> "Mon, 19 Oct 2026" */
export function dateLabel(d) {
  const [y, m, day] = d.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

/** Green: on time (before 10:10 AM). Red: late (10:10 AM or after). */
export const STATUS_STYLE = {
  'On time': 'bg-[#d3f0d9] text-[#0f6b2a]',
  Late: 'bg-[#f8c9c9] text-[#a40000]',
}

export const card = 'border border-line bg-white p-6 md:p-8'
export const inputClass =
  'mt-2 block h-12 w-full rounded-lg border border-ink/25 bg-white px-4 text-base outline-none transition hover:border-brand-deep focus:border-brand-deep focus:ring-4 focus:ring-brand/30'
