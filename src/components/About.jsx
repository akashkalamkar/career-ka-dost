import { IMAGES, IMAGE_FALLBACKS } from '../config/images'
import { PosterImage } from './PosterImage'
import { SectionHeading } from './SectionHeading'

const points = [
  'We help students choose the right college and career path—with clarity, not guesswork.',
  'Guidance for NEET, JEE, Engineering, Medical admissions and long-term career planning.',
  'Personalized counselling that respects your marks, rank, budget and dream branches.',
  'Parents stay involved at every step—transparent timelines, realistic options, calm decisions.',
]

export function About() {
  return (
    <section id="about" className="scroll-mt-24 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="About Career Ka Dost"
          title="Your trusted friend for admissions & career clarity"
          subtitle="Admission season is stressful—we simplify choices so students aim higher with confidence and parents sleep better at night."
        />
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="order-2 md:order-1">
            <ul className="space-y-4">
              {points.map((text) => (
                <li key={text} className="flex gap-3">
                  <span className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-400 text-xs font-bold text-slate-900">
                    ✓
                  </span>
                  <p className="text-base leading-relaxed text-slate-700">{text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/80 p-5 ring-1 ring-brand-100/60">
              <p className="text-sm font-semibold text-brand-800">Built for Instagram learners & busy parents</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Short, honest conversations. Actionable college lists. Support until you lock your seat—or pick the right stream after 10th.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl">
              <PosterImage
                src={IMAGES.about}
                fallback={IMAGE_FALLBACKS.about}
                alt="Career Ka Dost counselling and guidance"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
