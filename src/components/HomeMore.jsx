import { POSTS } from '../config/blog'
import { SERVICES } from '../config/services'
import { container } from '../config/ui'
import { ArrowIcon } from './icons'

/**
 * Below the home page banner: a short introduction, the service pages and the newest articles, so the
 * home page tells visitors (and Google) what Career Ka Dost does and links to the main pages.
 */
export function HomeMore() {
  const latest = [...POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  return (
    <section className="border-t border-line bg-paper-2 py-16 md:py-20">
      <div className={container}>
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">A trusted career counsellor in Nagpur - and online across India</h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Career Ka Dost helps students from Class 9 onwards, and their parents, make clear decisions about streams, courses, colleges and
            careers. Founder Bharat Rai and the team offer one-to-one career counselling, DMIT report counselling, and step-by-step admission
            guidance for MHT CET and JoSAA engineering counselling, NEET medical counselling, and courses such as law, BBA, MBA, B.Sc and BCA.
            Sessions are held at our office in Sitabuldi, Nagpur, and online for families anywhere in India.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Looking for a career counsellor near you in Nagpur? Our office is on the 2nd floor of Buty Chambers, opposite Fortune Mall, Sitabuldi - in the centre of the city. Families
            from Bhandara, Chandrapur, Wardha, Gondia and Amravati can also take the full session online.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Since March 2023 we have counselled 20,000+ students, most of them from Nagpur, Bhandara and Chandrapur, and families rate us 4.9
            on Google. Sessions are in English, Hindi or Marathi. Office hours: Monday to Saturday, 10 am to 6 pm (closed on Sunday).
          </p>
        </div>

        <a href="/stream-quiz" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-2 border-brand-deep bg-white p-5 transition hover:bg-brand/20">
          <span>
            <span className="block font-display text-xl font-extrabold">Confused after 10th? Take the free stream quiz</span>
            <span className="text-sm text-ink-soft">12 everyday questions: Science, Commerce or Arts - which suits you?</span>
          </span>
          <span className="inline-flex items-center gap-2 font-bold">
            Start the quiz <ArrowIcon className="h-4 w-4" />
          </span>
        </a>

        <h2 className="mt-12 font-display text-2xl font-extrabold">Our services</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((sv) => (
            <li key={sv.slug}>
              <a href={`/${sv.slug}`} className="flex h-full flex-col border border-line border-t-4 border-t-brand bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-brass">{sv.eyebrow}</span>
                <span className="mt-2 font-display text-lg font-extrabold leading-snug">{sv.h1}</span>
                <span className="mt-2 flex-1 text-sm text-ink-soft">{sv.description}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                  Know more <ArrowIcon className="h-4 w-4" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 font-display text-2xl font-extrabold">Latest guides</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {latest.map((p) => (
            <li key={p.slug}>
              <a href={`/blog/${p.slug}`} className="flex h-full flex-col border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-deep hover:shadow-lg">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-brass">{p.category}</span>
                <span className="mt-2 font-display text-lg font-bold leading-snug">{p.title}</span>
              </a>
            </li>
          ))}
        </ul>
        <a href="/blog" className="mt-6 inline-block font-bold underline decoration-brand decoration-2 underline-offset-4">
          See all articles
        </a>
      </div>
    </section>
  )
}
