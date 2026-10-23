import { container } from '../config/ui'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'

const steps = [
  { step: '01', title: 'Get in touch', desc: 'Message us on WhatsApp, call, or fill in the form. We reply quickly.' },
  { step: '02', title: 'Share your profile', desc: 'Scorecard, category, domicile and budget, so the advice stays realistic.' },
  { step: '03', title: 'Receive your plan', desc: 'A personal session with shortlists, timelines and backup scenarios.' },
  { step: '04', title: 'Choose with confidence', desc: 'Best-fit colleges and branches, plus a clear checklist for what comes next.' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-paper-2 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow="Process"
          title="Four steps from confusion to a confident choice."
          subtitle="Simple on mobile, clear for parents, and paced for a busy admission season."
        />
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <Tilt key={s.step} as="li" className="border border-line border-t-4 border-t-brand bg-white p-7 hover:shadow-2xl">
              <span className="flex h-14 w-14 items-center justify-center bg-brand font-display text-xl font-extrabold shadow-[0_4px_0_0_#b97f00] [transform:translateZ(44px)]">
                {s.step}
              </span>
              <h3 className="mt-7 font-display text-2xl font-extrabold leading-tight [transform:translateZ(28px)]">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft [transform:translateZ(14px)]">{s.desc}</p>
            </Tilt>
          ))}
        </ol>
      </div>
    </section>
  )
}
