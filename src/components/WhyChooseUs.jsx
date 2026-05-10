import { SectionHeading } from './SectionHeading'

const reasons = [
  {
    title: 'Expert counsellors',
    desc: 'Admission veterans who speak student—and parent.',
    icon: IconGradCap,
  },
  {
    title: 'Personalized guidance',
    desc: 'No generic PDFs; strategies tailored to your rank & budget.',
    icon: IconUserFocus,
  },
  {
    title: 'Transparent process',
    desc: 'Clear lists, honest trade-offs, documented next steps.',
    icon: IconShield,
  },
  {
    title: 'Parent involvement',
    desc: 'Joint sessions so decisions stay aligned at home.',
    icon: IconFamily,
  },
  {
    title: 'Best college suggestions',
    desc: 'Balance ambition, safety, location & ROI realistically.',
    icon: IconSpark,
  },
  {
    title: 'Complete admission support',
    desc: 'Choice filling tips to final seat acceptance guidance.',
    icon: IconSupport,
  },
]

export function WhyChooseUs() {
  return (
    <section id="why-us" className="scroll-mt-24 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Why Career Ka Dost"
          title="Built for trust—because this decision shapes decades"
          subtitle="We combine data with empathy so you never feel alone during counselling chaos."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-brand-50/40 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IconGradCap(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3 2 8l10 5 10-5-10-5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 8v6c0 2 4 4 10 4s10-2 10-4V8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13v4c1 2 4 3 5 3s4-1 5-3v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconUserFocus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-4 6-6 7-6s5.5 2 7 6" strokeLinecap="round" />
      <path d="M3 12h2M19 12h2M12 3v2M12 19v2" strokeLinecap="round" />
    </svg>
  )
}

function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3 5 6v5c0 5 3.5 9 7 11 3.5-2 7-6 7-11V6l-7-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconFamily(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c1-3 4.5-5 6-5s3 1 4 2M14 20c1-2 3-3 4.5-3" strokeLinecap="round" />
    </svg>
  )
}

function IconSpark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconSupport(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10Z" strokeLinejoin="round" />
      <path d="M9 12h6M12 9v6" strokeLinecap="round" />
    </svg>
  )
}
