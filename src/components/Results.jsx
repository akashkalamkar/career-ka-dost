import { FOUNDER, STATS } from '../config/site'
import { container } from '../config/ui'
import { Achievers } from './Achievers'
import { BarsArt } from './Art3D'
import { BoardIcon, ChipIcon, StarIcon, UsersIcon } from './icons'
import { SectionHeading } from './SectionHeading'
import { Testimonials } from './Testimonials'
import { Tilt } from './Tilt'

const STAT_ICONS = { users: UsersIcon, board: BoardIcon, star: StarIcon, chip: ChipIcon }

function Stars() {
  return (
    <span className="flex gap-1 text-brand" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
          <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" />
        </svg>
      ))}
    </span>
  )
}

export function Results() {
  return (
    <>
      <section id="results" className="scroll-mt-20 py-20 md:py-28">
        <div className={container}>
          <SectionHeading
            eyebrow="Our track record"
            title="Trusted by students and parents across India."
            subtitle="Years of focused counselling, training and workshops, and families who keep recommending us."
            art={<BarsArt />}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <Tilt key={s.label} as="article" className="bg-paper-2 p-8 transition-colors hover:bg-brand hover:shadow-2xl md:p-10">
                <span className="flex h-12 w-12 items-center justify-center bg-brand text-ink shadow-[0_4px_0_0_#b97f00] transition-colors group-hover/tilt:bg-white group-hover/tilt:text-brass group-hover/tilt:shadow-[0_4px_0_0_#a86400] [transform:translateZ(44px)]">
                  {(() => {
                    const Icon = STAT_ICONS[s.icon]
                    return <Icon className="h-6 w-6" />
                  })()}
                </span>
                <p className="mt-6 font-display text-4xl font-extrabold text-ink md:text-5xl [transform:translateZ(36px)]">{s.value}</p>
                <p className="mt-3 text-sm leading-snug text-ink-soft transition-colors group-hover/tilt:text-ink [transform:translateZ(14px)]">{s.label}</p>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      <Achievers />
      <Testimonials />

      <section className="py-20 md:py-28">
        <div className={`${container} grid gap-12 lg:grid-cols-2 lg:gap-16`}>
          <Tilt className="bg-white p-8 shadow-xl md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] [transform:translateZ(16px)]">Google rating</p>
            <p className="mt-6 font-display text-7xl font-extrabold leading-none [transform:translateZ(50px)]">4.9</p>
            <div className="mt-4 [transform:translateZ(34px)]">
              <Stars />
            </div>
            <p className="mt-6 leading-relaxed text-ink-soft [transform:translateZ(12px)]">
              Families trust us because we listen first, explain honestly and stay with them until the decision is made.
            </p>
          </Tilt>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Awards &amp; certifications</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
              Recognised for the work we do with students.
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {FOUNDER.awards.map((a) => (
                <Tilt key={a.name} as="li" max={10} className="flex items-center gap-4 border border-line border-l-4 border-l-brand bg-white p-4 font-semibold hover:shadow-xl">
                  <img src={a.logo} alt="" loading="lazy" className="h-12 w-12 shrink-0 object-contain [transform:translateZ(24px)]" />
                  <span className="[transform:translateZ(16px)]">{a.name}</span>
                </Tilt>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
