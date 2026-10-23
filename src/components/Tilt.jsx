import { useRef } from 'react'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A card that tilts in 3D toward the mouse pointer, with a soft light that follows the cursor.
 * It only reacts while the mouse is over it, so nothing moves on its own.
 * Children can pop forward with `[transform:translateZ(30px)]`.
 */
export function Tilt({ as: Tag = 'div', max = 8, lift = 1.02, glare = true, className = '', children, ...rest }) {
  const ref = useRef(null)

  function onMove(e) {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse' || reduceMotion()) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) scale3d(${lift}, ${lift}, ${lift})`
    el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`)
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group/tilt relative ${className}`}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out', willChange: 'transform' }}
      {...rest}
    >
      {children}
      {glare ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/tilt:opacity-100"
          style={{ background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.34), transparent 55%)' }}
        />
      ) : null}
    </Tag>
  )
}
