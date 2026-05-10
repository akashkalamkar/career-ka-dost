import { SectionHeading } from './SectionHeading'

const steps = [
  {
      step: '01',
      title: 'Contact us',
      desc: 'Tap WhatsApp, call, or drop details in the form—we respond quickly.',
    },
    {
      step: '02',
      title: 'Share your marks/rank',
      desc: 'Share scorecard, category, domicile & budget so advice stays realistic.',
    },
    {
      step: '03',
      title: 'Get counselling',
      desc: 'Personalized sessions with lists, timelines & backup scenarios.',
    },
    {
      step: '04',
      title: 'Choose best college/career',
      desc: 'Decision clarity—best-fit branches, colleges & next-mile checklist.',
    },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-brand-700 py-16 text-white md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          variant="dark"
          eyebrow="How it works"
          title="Four calm steps from confusion to a confident choice"
          subtitle="Fast on mobile, crystal-clear for parents—built for busy admission seasons."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className="relative rounded-3xl bg-white/10 p-6 shadow-lg ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/15"
            >
              <span className="text-4xl font-black text-accent-300/90">{s.step}</span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">{s.desc}</p>
              {idx < steps.length - 1 ? (
                <span
                  className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-white/40 lg:block"
                  aria-hidden
                >
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
