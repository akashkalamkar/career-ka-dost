import { Tilt } from './Tilt'

/**
 * Small 3D (isometric) illustrations used beside page headings. They are pure SVG in the brand colours,
 * decorative only, and tilt slightly toward the mouse. Nothing in them moves on its own.
 */

const C = 0.866
const S = 0.5
/** Isometric projection: world (x, y, z) to screen (x, y). */
const pt = (x, y, z) => [(x - y) * C, (x + y) * S - z]
const pts = (list) => list.map(([x, y, z]) => pt(x, y, z).map((n) => n.toFixed(1)).join(',')).join(' ')

const Y = { top: '#ffd24d', left: '#f2a900', right: '#c98400' }
const K = { top: '#ffb066', left: '#f08a2c', right: '#cf6d12' } // warm orange (was black)
// The climb: a dark first step (where students start), then pale yellow getting richer, to the brand colour on the winning step.
const STEPS = [
  { top: '#4d4d4d', left: '#2f2f2f', right: '#1b1b1b' },
  { top: '#fff4c2', left: '#ffe99a', right: '#f5d75e' },
  { top: '#ffe480', left: '#ffd75a', right: '#ecb92c' },
  { top: '#ffd24d', left: '#ffc533', right: '#e5a50f' },
  { top: '#ffc233', left: '#ffb81c', right: '#d98f00' },
]
const B = { top: '#f0b27a', left: '#d98b45', right: '#b66d27' } // bronze: third place
const BROWN = '#7a4a00'
const W = { top: '#ffffff', left: '#efe9da', right: '#d8d0bc' }
const CR = { top: '#fff6dc', left: '#f1e3b8', right: '#dbc98f' }

/** A block with three shaded faces. */
function Box({ x, y, z = 0, w, d, h, c }) {
  return (
    <g strokeLinejoin="round">
      <polygon points={pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={c.left} />
      <polygon points={pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={c.right} />
      <polygon points={pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={c.top} />
    </g>
  )
}

/** Matrix that lays flat 2D drawing onto the top of a block at (x, y, z). */
const onTop = (x, y, z) => {
  const [e, f] = pt(x, y, z)
  return `matrix(${C} ${S} ${-C} ${S} ${e.toFixed(1)} ${f.toFixed(1)})`
}
/** Matrix that places drawing on the left-facing side of a block (spans x and z). */
const onLeft = (x, y, z) => {
  const [e, f] = pt(x, y, z)
  return `matrix(${C} ${S} 0 1 ${e.toFixed(1)} ${f.toFixed(1)})`
}

function Shadow({ cx = 0, cy = 0, rx, ry }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="rgba(0,0,0,0.14)" />
}

function Frame({ viewBox, className = 'max-w-[19rem]', children }) {
  return (
    <Tilt max={10} lift={1.04} glare={false} className={`mx-auto w-full ${className}`} aria-hidden="true">
      <svg viewBox={viewBox} className="block h-auto w-full overflow-visible drop-shadow-[0_18px_16px_rgba(0,0,0,0.16)]" focusable="false">
        {children}
      </svg>
    </Tilt>
  )
}

/** Books topped with a graduation cap: learning, guides, blog. */
export function BooksArt({ className }) {
  return (
    <Frame viewBox="-95 -85 190 190" className={className}>
      <Shadow cy={46} rx={86} ry={28} />
      <Box x={0} y={0} z={0} w={90} d={64} h={16} c={K} />
      <Box x={3} y={2} z={16} w={84} d={60} h={14} c={Y} />
      <Box x={6} y={4} z={30} w={78} d={56} h={12} c={W} />
      <Box x={28} y={15} z={42} w={34} d={34} h={14} c={K} />
      <Box x={10} y={-3} z={56} w={70} d={70} h={5} c={{ top: '#ffc58a', left: '#f2994a', right: '#d9741a' }} />
      <Box x={42} y={29} z={61} w={6} d={6} h={3} c={Y} />
      <polyline points={pts([[45, 32, 62], [76, 1, 62], [78, -1, 44]])} fill="none" stroke="#ffb81c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <Box x={75} y={-4} z={34} w={6} d={6} h={10} c={Y} />
    </Frame>
  )
}

/** A student standing on the winning step, one arm up, waving a chequered flag. Feet are at (x, y). */
function WinnerStudent({ x, y }) {
  const SKIN_TONE = '#f2c9a0'
  return (
    <g transform={`translate(${x} ${y}) scale(0.92)`}>
      <ellipse cx="0" cy="1" rx="13" ry="3.2" fill="rgba(0,0,0,0.14)" />
      {/* legs */}
      <line x1="-3.2" y1="-22" x2="-7" y2="-1" stroke="#7a4a00" strokeWidth="5.2" strokeLinecap="round" />
      <line x1="3.2" y1="-22" x2="7" y2="-1" stroke="#7a4a00" strokeWidth="5.2" strokeLinecap="round" />
      {/* arm that holds the flag, raised */}
      <line x1="6" y1="-37" x2="11" y2="-57" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" />
      <line x1="6" y1="-37" x2="11" y2="-57" stroke="#f0dca0" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      {/* flag pole and chequered flag */}
      <line x1="8" y1="-57" x2="40" y2="-87" stroke="#7a4a00" strokeWidth="1.8" strokeLinecap="round" />
      <g transform="matrix(0.73 -0.68 0.68 0.73 17.6 -65.2)">
        {[0, 1, 2, 3, 4].map((i) =>
          [0, 1, 2].map((j) => <rect key={`${i}-${j}`} x={i * 5} y={j * 5} width="5" height="5" fill={(i + j) % 2 ? '#ffffff' : '#3b2400'} />)
        )}
        <rect x="0" y="0" width="25" height="15" fill="none" stroke="#3b2400" strokeWidth="0.6" />
      </g>
      <circle cx="11" cy="-58.5" r="2.6" fill={SKIN_TONE} />
      {/* body */}
      <rect x="-7.5" y="-41" width="15" height="21" rx="4" fill="#ffffff" stroke="#e8cf86" strokeWidth="0.8" />
      <polygon points="0,-41 -2.4,-38 0,-30 2.4,-38" fill="#ffb81c" />
      {/* arm down */}
      <line x1="-6.5" y1="-38" x2="-10" y2="-25" stroke="#ffffff" strokeWidth="4.4" strokeLinecap="round" />
      <circle cx="-10.4" cy="-23.6" r="2.4" fill={SKIN_TONE} />
      {/* head */}
      <circle cx="0" cy="-48.5" r="7" fill={SKIN_TONE} />
      <path d="M-7 -49.5 C-6.5 -57 6.5 -57 7 -49.5 C3.5 -52.8 -3.5 -52.8 -7 -49.5 Z" fill="#5a3a12" />
      <path d="M-2.6 -47 q2.6 2.4 5.2 0" fill="none" stroke="#7a4a00" strokeWidth="0.9" strokeLinecap="round" />
    </g>
  )
}

/** Stepped climb to a winner on the top step: growth, direction, about. */
export function StepsArt({ className }) {
  return (
    <Frame viewBox="-70 -150 205 262" className={className}>
      <Shadow cx={30} cy={76} rx={92} ry={26} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} x={(4 - i) * 28 - 0} y={0} z={0} w={28} d={62} h={14 * (i + 1)} c={STEPS[i]} />
      )).reverse()}
      <WinnerStudent x={-14.7} y={-47.5} />
    </Frame>
  )
}

/** Rising bars on a plate: results, numbers. */
export function BarsArt({ className }) {
  const heights = [26, 44, 66, 92]
  return (
    <Frame viewBox="-95 -100 240 210" className={className}>
      <Shadow cx={20} cy={52} rx={110} ry={30} />
      <Box x={-10} y={-10} z={0} w={170} d={46} h={6} c={W} />
      {heights.map((h, i) => (
        <Box key={h} x={i * 44} y={0} z={6} w={28} d={26} h={h} c={[STEPS[0], STEPS[1], STEPS[3], STEPS[4]][i]} />
      ))}
    </Frame>
  )
}

/** Podium with a star: achievers, rankings. */
export function PodiumArt({ className }) {
  const blocks = [
    { x: 0, h: 34, n: '2', c: W },
    { x: 48, h: 52, n: '1', c: Y },
    { x: 96, h: 24, n: '3', c: B },
  ]
  const [sx, sy] = pt(70, 22, 52 + 34)
  const star = (ox = 0, oy = 0) =>
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map((k) => {
        const r = k % 2 === 0 ? 22 : 9
        const a = (-90 + k * 36) * (Math.PI / 180)
        return `${(sx + ox + r * Math.cos(a)).toFixed(1)},${(sy + oy + r * Math.sin(a)).toFixed(1)}`
      })
      .join(' ')
  return (
    <Frame viewBox="-85 -105 235 215" className={className}>
      <Shadow cx={30} cy={44} rx={100} ry={30} />
      {blocks.map((b) => (
        <g key={b.n}>
          <Box x={b.x} y={0} z={0} w={44} d={44} h={b.h} c={b.c} />
          <g transform={onLeft(b.x, 44, b.h)}>
            <text x={22} y={b.h / 2 + 8} textAnchor="middle" fontSize="22" fontWeight="800" fontFamily="Figtree, sans-serif" fill={b.c === B ? '#fff3d6' : BROWN}>
              {b.n}
            </text>
          </g>
        </g>
      ))}
      <polygon points={star(4, 5)} fill="#c98400" />
      <polygon points={star()} fill="#ffd24d" stroke={BROWN} strokeWidth="1.6" strokeLinejoin="round" />
    </Frame>
  )
}

/** Coin stacks: pricing. */
export function CoinsArt({ className }) {
  const Coin = ({ cx, cy, mark }) => (
    <g>
      <path d={`M${cx - 36} ${cy} v8 a36 18 0 0 0 72 0 v-8 Z`} fill="#c98400" />
      <ellipse cx={cx} cy={cy} rx={36} ry={18} fill="#ffd24d" stroke="#f2a900" strokeWidth="1.2" />
      <ellipse cx={cx} cy={cy} rx={26} ry={13} fill="none" stroke="#f2a900" strokeWidth="1.6" />
      {mark ? (
        <text transform={`translate(${cx} ${cy}) scale(1 0.5)`} textAnchor="middle" dy="0.35em" fontSize="26" fontWeight="800" fontFamily="Figtree, sans-serif" fill="#a86400">
          &#8377;
        </text>
      ) : null}
    </g>
  )
  const stack = (cx, base, n) =>
    Array.from({ length: n }, (_, i) => <Coin key={`${cx}-${i}`} cx={cx} cy={base - i * 8} mark={i === n - 1} />)
  return (
    <Frame viewBox="0 0 250 210" className={className}>
      <Shadow cx={125} cy={176} rx={112} ry={22} />
      {stack(100, 150, 6)}
      {stack(46, 168, 3)}
      {stack(172, 170, 4)}
    </Frame>
  )
}

/** Extruded question mark on a plinth: FAQ. */
export function QuestionArt({ className }) {
  const style = { fontFamily: 'Figtree, sans-serif', fontWeight: 800, fontSize: 190 }
  return (
    <Frame viewBox="0 0 220 250" className={className}>
      <g transform="translate(110 200)">
        <Shadow cy={20} rx={78} ry={24} />
        <Box x={-40} y={-40} z={0} w={80} d={80} h={14} c={K} />
      </g>
      {Array.from({ length: 17 }, (_, k) => 17 - k).map((i) => (
        <text key={i} x={110 + i * 0.9} y={178 - i * 0.5} textAnchor="middle" fill={i % 2 ? '#c98400' : '#d99100'} style={style}>
          ?
        </text>
      ))}
      <text x={110} y={178} textAnchor="middle" fill="#ffd24d" stroke={BROWN} strokeWidth="2" paintOrder="stroke" style={style}>
        ?
      </text>
    </Frame>
  )
}

/** Clipboard with a checklist: career test. */
export function ClipboardArt({ className }) {
  const row = (y, done) => (
    <g key={y}>
      <rect x={8} y={y} width={9} height={9} fill="#fff" stroke={BROWN} strokeWidth="1.4" />
      {done ? <path d={`M10 ${y + 4.5} l2.6 2.8 l5.2 -6.6`} fill="none" stroke="#f2a900" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> : null}
      <rect x={24} y={y + 2.5} width={done ? 40 : 30} height={4} fill="#cfc6b0" />
    </g>
  )
  return (
    <Frame viewBox="-100 -40 200 190" className={className}>
      <Shadow cy={78} rx={92} ry={26} />
      <Box x={0} y={0} z={0} w={84} d={108} h={8} c={K} />
      <Box x={6} y={12} z={8} w={72} d={92} h={1.2} c={W} />
      <g transform={onTop(6, 12, 9.2)}>{[10, 30, 50, 70].map((y, i) => row(y, i < 2))}</g>
      <Box x={27} y={4} z={8} w={30} d={10} h={7} c={Y} />
    </Frame>
  )
}

/** Thick shield with a check: policies, trust. */
export function ShieldArt({ className }) {
  const d = 'M100 14 L176 42 V104 C176 150 142 182 100 202 C58 182 24 150 24 104 V42 Z'
  return (
    <Frame viewBox="0 0 215 235" className={className}>
      <ellipse cx="108" cy="218" rx="70" ry="12" fill="rgba(0,0,0,0.14)" />
      {Array.from({ length: 14 }, (_, k) => 14 - k).map((i) => (
        <path key={i} d={d} transform={`translate(${i * 0.9} ${i * 0.7})`} fill={i % 2 ? '#c98400' : '#b87500'} />
      ))}
      <path d={d} fill="#ffd24d" stroke={BROWN} strokeWidth="2" strokeLinejoin="round" />
      <path d="M100 34 L158 55 V104 C158 138 134 162 100 180 C66 162 42 138 42 104 V55 Z" fill="#ffb81c" />
      <path d="M72 106 l20 22 l38 -48" fill="none" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  )
}

/** Map tile with a location pin: contact, visit us. */
export function PinArt({ className }) {
  return (
    <Frame viewBox="-115 -105 230 250" className={className}>
      <Shadow cy={58} rx={106} ry={34} />
      <Box x={0} y={0} z={0} w={120} d={120} h={8} c={CR} />
      <g transform={onTop(0, 0, 8.2)}>
        <rect x={0} y={50} width={120} height={20} fill="#fff" />
        <rect x={50} y={0} width={20} height={120} fill="#fff" />
        <path d="M0 60 H120 M60 0 V120" stroke="#ffb81c" strokeWidth="1.6" strokeDasharray="6 5" fill="none" />
      </g>
      <Box x={10} y={10} z={8} w={26} d={26} h={20} c={W} />
      <Box x={84} y={10} z={8} w={26} d={26} h={34} c={K} />
      <Box x={10} y={84} z={8} w={26} d={26} h={26} c={Y} />
      <g transform="translate(0 52)">
        <ellipse cx="0" cy="3" rx="16" ry="6" fill="rgba(0,0,0,0.25)" />
        <path d="M0 0 C-18 -24 -29 -40 -29 -57 A29 29 0 1 1 29 -57 C29 -40 18 -24 0 0 Z" fill="#e53935" />
        <path d="M0 0 C-18 -24 -29 -40 -29 -57 A29 29 0 0 1 -6 -85 C-22 -70 -22 -50 -2 -8 Z" fill="#ff6f66" opacity="0.7" />
        <circle cx="0" cy="-57" r="12" fill="#fff" />
      </g>
    </Frame>
  )
}

/** Large extruded quotation mark: testimonials. */
export function QuoteArt({ className }) {
  const d = 'M0 48V28C0 12 8 2 24 0l2 8C17 10 13 15 13 22h13v26H0Zm38 0V28C38 12 46 2 62 0l2 8c-9 2-13 7-13 14h13v26H38Z'
  return (
    <Frame viewBox="0 0 230 190" className={className}>
      <ellipse cx="108" cy="168" rx="82" ry="12" fill="rgba(0,0,0,0.14)" />
      {Array.from({ length: 14 }, (_, k) => 14 - k).map((i) => (
        <path key={i} d={d} transform={`translate(${24 + i * 0.9} ${36 - i * 0.6}) scale(2.6)`} fill={i % 2 ? '#c98400' : '#d99100'} />
      ))}
      <path d={d} transform="translate(24 36) scale(2.6)" fill="#ffd24d" stroke={BROWN} strokeWidth="0.9" strokeLinejoin="round" />
    </Frame>
  )
}
