import { IMAGES, IMAGE_FALLBACKS } from '../config/images'
import { PosterImage } from './PosterImage'
import { SectionHeading } from './SectionHeading'

const services = [
  {
    key: 'neet',
    title: 'NEET Counselling',
    accent: 'From AIQ to state merit—we decode choices.',
    bullets: ['MBBS/BDS guidance', 'AIQ & State quota support', 'College prediction', 'Budget planning'],
    img: IMAGES.neet,
    fallback: IMAGE_FALLBACKS.neet,
  },
  {
    key: 'engineering',
    title: 'Engineering Counselling',
    accent: 'JEE Main/Advanced & private admissions covered.',
    bullets: ['JEE counselling roadmap', 'IIT/NIT/private colleges', 'Branch selection strategy', 'Cutoff & trend analysis'],
    img: IMAGES.engineering,
    fallback: IMAGE_FALLBACKS.engineering,
  },
  {
    key: 'career',
    title: 'Career Guidance',
    accent: 'Pick streams & careers that fit your strengths.',
    bullets: ['Career path discovery', 'Future-ready planning', 'Stream selection after 10th', 'Psychometric-friendly guidance'],
    img: IMAGES.career,
    fallback: IMAGE_FALLBACKS.career,
  },
  {
    key: 'dna',
    title: 'Career DNA Test',
    accent: 'Science-backed insight into interests & personality.',
    bullets: ['Personality analysis', 'Interest mapping', 'Detailed career report', 'Future roadmap sessions'],
    img: IMAGES.dna,
    fallback: IMAGE_FALLBACKS.dna,
  },
]

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Services"
          title="Everything you need—from NEET lists to branch clarity"
          subtitle="Premium counselling cards packed with what parents Google at 2 a.m.: quotas, cutoffs, budgets, and backup plans."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((s) => (
            <article
              key={s.key}
              className="group overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-2xl hover:ring-brand-200"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <PosterImage
                  src={s.img}
                  fallback={s.fallback}
                  alt={`${s.title} — Career Ka Dost`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white md:text-2xl">{s.title}</h3>
                  <p className="mt-1 text-sm text-white/90">{s.accent}</p>
                </div>
              </div>
              <ul className="grid gap-3 p-6 sm:grid-cols-2">
                {s.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 rounded-xl bg-brand-50/70 px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-brand-100/80"
                  >
                    <span className="mt-0.5 text-accent-500">●</span>
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
