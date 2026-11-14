import { POSTS } from '../config/blog'
import { container } from '../config/ui'
import { formatDate } from '../utils/date'
import { BooksArt } from './Art3D'
import { ArrowIcon } from './icons'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'

export function Blog() {
  return (
    <section id="blog" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <SectionHeading as="h1"
          eyebrow="Blog"
          title="Career guidance blog for students and parents."
          subtitle="Plain-language guides on career options after 10th and 12th, MHT CET and NEET counselling in Maharashtra, JoSAA, choosing a stream, a college or a career counsellor - written by the Career Ka Dost team in Nagpur, and checked against official sources."
          art={<BooksArt />}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...POSTS].sort((a, b) => b.date.localeCompare(a.date)).map((p) => (
            <Tilt key={p.slug} as="article" className="group flex flex-col border border-line border-t-4 border-t-brand bg-white hover:shadow-2xl">
              <a href={`/blog/${p.slug}`} className="flex flex-1 flex-col p-7">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brass [transform:translateZ(14px)]">{p.category}</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold leading-snug [transform:translateZ(28px)]">{p.title}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-ink-soft [transform:translateZ(10px)]">{p.excerpt}</p>
                <p className="mt-6 text-sm text-mute">
                  {formatDate(p.date)} &middot; {p.readTime}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold [transform:translateZ(24px)]">
                  Read article
                  <ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1" />
                </span>
              </a>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  )
}
