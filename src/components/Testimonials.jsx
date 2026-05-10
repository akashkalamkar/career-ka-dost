import { SectionHeading } from './SectionHeading'

const items = [
  {
    quote:
      'My NEET rank felt confusing until Career Ka Dost broke down AIQ vs state options. We shortlisted colleges within budget—and I got clarity in days, not weeks.',
    name: 'Ananya S.',
    role: 'NEET aspirant',
    badge: 'Medical admissions',
  },
  {
    quote:
      'As parents we were overwhelmed by quotas and deadlines. Their transparent lists and calm counselling helped us support our son without arguing at home.',
    name: 'Rajesh & Meera P.',
    role: 'Parents of JEE student',
    badge: 'Family-first guidance',
  },
  {
    quote:
      'After 12th I was torn between branches. The engineering roadmap plus cutoff trends helped me pick a college where I could thrive—not just survive.',
    name: 'Karan M.',
    role: 'Engineering entrant',
    badge: 'JEE counselling',
  },
  {
    quote:
      'Career Ka Dost didn’t rush us. They respected my daughter’s score range and showed realistic backups—exactly what we needed during stressful rounds.',
    name: 'Sunita K.',
    role: 'Parent',
    badge: 'Trust & patience',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Success stories"
          title="Students aim higher. Parents breathe easier."
          subtitle="Sample feedback reflecting what counselling should feel like—clear, human, and relentlessly practical."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((t) => (
            <figure
              key={t.name}
              className="rounded-3xl bg-white p-7 shadow-md ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="inline-flex rounded-full bg-accent-400/90 px-3 py-1 text-xs font-bold text-slate-900">{t.badge}</div>
              <blockquote className="mt-4 text-base leading-relaxed text-slate-700">
                <span className="text-brand-600">“</span>
                {t.quote}
                <span className="text-brand-600">”</span>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-md shadow-brand-600/25">
                  {t.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
