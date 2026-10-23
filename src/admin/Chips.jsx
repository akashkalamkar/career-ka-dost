import { STATUS_STYLE, time12 } from './format'

export function StatusChip({ status }) {
  if (!status) return <span className="inline-block bg-paper-2 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-mute">Not checked in</span>
  return <span className={`inline-block px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${STATUS_STYLE[status]}`}>{status}</span>
}

/** The check-in time, coloured by the status. */
export function CheckInTime({ rec }) {
  if (!rec || !rec.checkIn) return <span className="text-mute">-</span>
  return <span className={`inline-block px-2.5 py-1 font-bold ${STATUS_STYLE[rec.status] || ''}`}>{time12(rec.checkIn)}</span>
}

const LEAVE_STYLE = {
  Pending: 'bg-[#fff1c2] text-[#7a5200]',
  Accepted: 'bg-[#d3f0d9] text-[#0f6b2a]',
  Rejected: 'bg-[#f8c9c9] text-[#a40000]',
  Cancelled: 'bg-paper-2 text-mute',
}

/** Pending (amber), Accepted (green), Rejected (red), Cancelled (grey). */
export function LeaveChip({ status }) {
  return <span className={`inline-block px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${LEAVE_STYLE[status] || LEAVE_STYLE.Cancelled}`}>{status}</span>
}

/** Shown in the team table when someone is on an accepted leave today. */
export function OnLeaveChip({ leave }) {
  const label = leave.type === 'Half day' ? `On leave (${leave.half})` : 'On leave'
  return <span className="inline-block bg-[#dbe9ff] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0d3a8a]">{label}</span>
}
