import { ACHIEVERS, ACHIEVERS_ROUND } from '../config/achievers'
import { container } from '../config/ui'
import { PodiumArt } from './Art3D'
import { CapIcon } from './icons'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'

export function Achievers() {
  return (
    <section id="achievers" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow={`${ACHIEVERS_ROUND} · College allotment`}
          title="Congratulations to our proud achievers."
          subtitle="Students we guided who have secured their college seat. Proud to be a part of your journey."
          art={<PodiumArt />}
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVERS.map((s) => (
            <Tilt
              key={s.name}
              as="li"
              className="flex flex-col border border-line border-t-4 border-t-brand bg-paper-2 transition-colors hover:bg-brand hover:shadow-2xl"
            >
              <div className="flex h-60 items-end justify-center overflow-hidden px-6 pt-6">
                <img
                  src={s.photo}
                  alt={`${s.name}, ${ACHIEVERS_ROUND} college allotment`}
                  loading="lazy"
                  className="max-h-full w-auto max-w-full object-contain drop-shadow-[0_14px_14px_rgba(0,0,0,0.18)] [transform:translateZ(50px)]"
                />
              </div>
              <div className="flex flex-1 flex-col bg-white p-6 [transform:translateZ(8px)]">
                <p className="font-display text-xl font-extrabold leading-tight">{s.name}</p>
                <p className="mt-3 flex flex-1 items-start gap-2 text-sm leading-relaxed text-ink-soft">
                  <CapIcon className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                  {s.college}
                </p>
                <p className="mt-4 inline-block self-start bg-brand px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em]">
                  {ACHIEVERS_ROUND} allotment
                </p>
              </div>
            </Tilt>
          ))}
        </ul>
      </div>
    </section>
  )
}
