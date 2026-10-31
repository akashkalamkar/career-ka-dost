import { useEffect, useState } from 'react'
import { visitCounterOn, watchTotal } from '../utils/visits'

/** "Total visits: 12,345" with a pulsing green dot; updates live. Shows nothing until the number arrives. */
export function VisitCounter() {
  const [total, setTotal] = useState(null)

  useEffect(() => watchTotal(setTotal), [])

  if (!visitCounterOn || total === null) return null
  return (
    <p className="flex items-center gap-2" aria-live="polite">
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1b9e57] opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1b9e57]" />
      </span>
      Total visits: <span className="tabular-nums text-ink">{total.toLocaleString('en-IN')}</span>
    </p>
  )
}
