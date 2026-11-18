import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

/** Falling confetti for a few seconds (drawn here, no library). Skipped when the visitor prefers less motion. */
function Confetti() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = (canvas.width = window.innerWidth * dpr)
    const h = (canvas.height = window.innerHeight * dpr)
    const colours = ['#ffbd17', '#d40000', '#13233f', '#25a244', '#1976d2', '#ff7a00']
    const bits = Array.from({ length: 160 }, () => ({
      x: Math.random() * w,
      y: -Math.random() * h * 0.6,
      r: (4 + Math.random() * 6) * dpr,
      c: colours[Math.floor(Math.random() * colours.length)],
      vy: (2 + Math.random() * 3) * dpr,
      vx: (Math.random() - 0.5) * 2 * dpr,
      a: Math.random() * Math.PI,
      va: (Math.random() - 0.5) * 0.3,
    }))
    let frame = 0
    let id = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const b of bits) {
        b.x += b.vx
        b.y += b.vy
        b.a += b.va
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(b.a)
        ctx.fillStyle = b.c
        ctx.fillRect(-b.r / 2, -b.r / 4, b.r, b.r / 2)
        ctx.restore()
      }
      frame += 1
      if (frame < 260) id = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, w, h)
    }
    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [])
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[81] h-full w-full" aria-hidden />
}

/** "Hurray! Congratulations" pop-up shown when a checklist is complete. */
export function Celebration({ title, message, children, onClose }) {
  const titleId = useId()
  const closeRef = useRef(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#5c3b00]/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-md border-t-8 border-brand bg-white p-7 text-center shadow-2xl">
          <p className="text-5xl" aria-hidden>
            🎉
          </p>
          <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.2em] text-brass">Hurray!</p>
          <h2 id={titleId} className="mt-1 font-display text-3xl font-extrabold leading-tight">
            {title}
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{message}</p>
          <div className="mt-6 flex flex-col gap-3">{children}</div>
          <button ref={closeRef} type="button" onClick={onClose} className="mt-4 text-sm font-bold underline decoration-brand decoration-2 underline-offset-4">
            Close
          </button>
        </div>
      </div>
      <Confetti />
    </>,
    document.body,
  )
}
