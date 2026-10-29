import { container } from '../config/ui'
import { StepsArt } from './Art3D'
import { EyeIcon, TargetIcon } from './icons'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'

/** Top edge of the stepped wall (viewBox 1100 x 340). */
const WALK = 'M0 316 L170 316 L290 262 L420 262 L540 208 L670 208 L790 154 L920 154 L1040 100'
const WALL = `${WALK} L1040 340 L0 340 Z`

const SKIN = '#e6b08a'
const SKIN_2 = '#d49a72'
const JACKET = '#3b3b3b'

function Leg({ x, hipY, w, h, color, angle }) {
  return (
    <g transform={`translate(${x} ${hipY}) rotate(${angle})`}>
      <rect x={-w / 2} y="0" width={w} height={h} rx={w / 2} fill={color} />
      <rect x={-w / 2 - 1} y={h - 3} width={w + 5} height="4" rx="2" fill="#111" />
    </g>
  )
}

function Arm({ x, y, len, color, angle }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x="-3" y="-2" width="6" height={len} rx="3" fill={color} />
    </g>
  )
}

/** A teacher and a student holding hands, mid-stride. Feet are at (0,0). */
function Pair() {
  return (
    <g>
      {/* Teacher */}
      <Leg x={-19} hipY={-34} w={7.5} h={34} color="#2d2d2d" angle={14} />
      <Leg x={-13} hipY={-34} w={7.5} h={34} color="#262626" angle={-14} />
      <Arm x={-27} y={-58} len={26} color={JACKET} angle={-14} />
      <rect x={-28} y={-64} width={24} height={32} rx={7} fill={JACKET} />
      <path d="M-19 -64 L-16 -52 L-13 -64 Z" fill="#fff" />
      <rect x={-17.5} y={-62} width={3} height={14} rx={1} fill="#ffb81c" />
      <circle cx={-16} cy={-72} r={8.5} fill={SKIN} />
      <path d="M-24.5 -73 C-24 -82 -8 -82 -7.5 -73 C-12 -77 -20 -77 -24.5 -73 Z" fill="#1b1b1b" />
      <g fill="none" stroke="#7a4a00" strokeWidth="1">
        <circle cx={-19.2} cy={-71.5} r={2.3} />
        <circle cx={-12.8} cy={-71.5} r={2.3} />
        <path d="M-16.9 -71.5 h1.8" />
      </g>
      <line x1={-8} y1={-58} x2={4} y2={-31} stroke={JACKET} strokeWidth="6" strokeLinecap="round" />

      {/* Student */}
      <Leg x={15} hipY={-24} w={6} h={24} color="#575757" angle={-14} />
      <Leg x={21} hipY={-24} w={6} h={24} color="#4a4a4a" angle={14} />
      <rect x={3} y={-45} width={13} height={21} rx={4} fill="#1b1b1b" />
      <Arm x={32} y={-39} len={20} color="#ffb81c" angle={14} />
      <rect x={9} y={-46} width={21} height={24} rx={6} fill="#ffb81c" />
      <circle cx={19.5} cy={-54} r={7.2} fill={SKIN_2} />
      <path d="M12.2 -55 C12.5 -63 26.5 -63 26.8 -55 C23 -58 16 -58 12.2 -55 Z" fill="#1b1b1b" />
      <line x1={11} y1={-41} x2={4} y2={-31} stroke="#ffb81c" strokeWidth="5" strokeLinecap="round" />

      <circle cx={4} cy={-30.5} r={3.6} fill={SKIN} />
    </g>
  )
}

/** Still picture: a teacher and a student on the climb toward the goal. */
function Journey() {
  return (
    <svg viewBox="0 0 1100 340" className="block h-auto w-full" role="img" aria-label="A teacher and a student holding hands and climbing steps toward a flag">
      <path d={WALL} fill="#ffe7a3" />
      <path d={WALK} fill="none" stroke="#ffb81c" strokeWidth="12" strokeLinejoin="miter" />
      <g>
        <line x1="1040" y1="94" x2="1040" y2="40" stroke="#7a4a00" strokeWidth="3" />
        <path d="M1042 42 L1076 54 L1042 66 Z" fill="#ffb81c" stroke="#7a4a00" strokeWidth="2" />
      </g>
      <g transform="translate(600 202) scale(1.7)">
        <Pair />
      </g>
    </svg>
  )
}

export function MissionVision() {
  return (
    <section id="about" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow="Our vision and mission"
          title="Clarity, confidence and the right direction."
          subtitle="We help students choose a career based on aptitude, interests and real opportunities, not pressure or trends."
          art={<StepsArt />}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <Tilt as="article" className="bg-paper-2 p-8 transition-colors hover:bg-brand hover:shadow-2xl md:p-12">
            <span className="flex h-12 w-12 items-center justify-center bg-brand text-ink shadow-[0_4px_0_0_#b97f00] transition-colors group-hover/tilt:bg-white group-hover/tilt:text-brass group-hover/tilt:shadow-[0_4px_0_0_#a86400] [transform:translateZ(40px)]">
              <EyeIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-8 font-display text-3xl font-extrabold tracking-tight md:text-4xl [transform:translateZ(28px)]">Our Vision</h3>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft transition-colors group-hover/tilt:text-ink [transform:translateZ(18px)]">
              To become a trusted career guidance partner for every student, ensuring that no career decision is made in
              confusion, pressure or lack of awareness.
            </p>
          </Tilt>

          <Tilt as="article" className="bg-paper-2 p-8 transition-colors hover:bg-brand hover:shadow-2xl md:p-12">
            <span className="flex h-12 w-12 items-center justify-center bg-brand text-ink shadow-[0_4px_0_0_#b97f00] transition-colors group-hover/tilt:bg-white group-hover/tilt:text-brass group-hover/tilt:shadow-[0_4px_0_0_#a86400] [transform:translateZ(40px)]">
              <TargetIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-8 font-display text-3xl font-extrabold tracking-tight md:text-4xl [transform:translateZ(28px)]">Our Mission</h3>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft transition-colors group-hover/tilt:text-ink [transform:translateZ(18px)]">
              To guide students towards the right career through clarity, confidence and correct direction, based on aptitude,
              interests and real opportunities, not pressure or trends.
            </p>
            <p className="mt-4 font-bold [transform:translateZ(12px)]">We guide both students and parents at every step.</p>
          </Tilt>
        </div>

        <Tilt max={3} lift={1.01} glare={false} className="mt-8 overflow-hidden border border-line bg-paper-2 shadow-lg">
          <div className="grid items-end gap-6 p-6 md:grid-cols-12 md:p-10">
            <div className="md:col-span-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Hand in hand</p>
              <p className="mt-3 font-display text-2xl font-extrabold leading-tight">From the first question to the final decision.</p>
              <p className="mt-3 text-ink-soft">We walk every step with the student, and with the parents too.</p>
            </div>
            <div className="md:col-span-8">
              <Journey />
            </div>
          </div>
        </Tilt>
      </div>
    </section>
  )
}
