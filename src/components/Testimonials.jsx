import { TESTIMONIALS } from '../config/testimonials'
import { container } from '../config/ui'
import { QuoteArt } from './Art3D'
import { StarIcon } from './icons'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'

function Stars({ count = 5 }) {
  return (
    <span className="flex gap-1 text-brand" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <StarIcon key={i} className="h-5 w-5" />
      ))}
    </span>
  )
}

function QuoteMark({ className = '' }) {
  return (
    <svg viewBox="0 0 64 48" className={className} fill="currentColor" aria-hidden>
      <path d="M0 48V28C0 12 8 2 24 0l2 8C17 10 13 15 13 22h13v26H0Zm38 0V28C38 12 46 2 62 0l2 8c-9 2-13 7-13 14h13v26H38Z" />
    </svg>
  )
}

function Avatar({ t, className }) {
  if (t.photo) {
    return <img src={t.photo} alt={`${t.name}, student`} loading="lazy" className={`${className} object-cover`} />
  }
  const initials = t.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  return (
    <span className={`${className} flex items-center justify-center bg-brand font-display text-4xl font-extrabold`} aria-hidden>
      {initials}
    </span>
  )
}

function Featured({ t }) {
  return (
    <Tilt as="article" max={4} lift={1.01} glare={false} className="border border-line border-t-8 border-t-brand bg-white shadow-xl">
      <div className="grid md:grid-cols-12">
        <div className="flex items-center bg-brand p-6 md:col-span-4 md:p-8">
          <Avatar t={t} className="aspect-square w-full rounded-2xl shadow-[0_14px_30px_rgba(0,0,0,0.25)] [transform:translateZ(46px)]" />
        </div>
        <div className="p-8 md:col-span-8 md:p-12">
          <div className="[transform:translateZ(20px)]">
            <div className="flex items-center justify-between">
              <QuoteMark className="h-10 w-10 text-brand" />
              <Stars count={t.rating} />
            </div>
            <blockquote className="mt-6 font-display text-xl font-bold leading-relaxed md:text-2xl md:leading-relaxed">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-8 border-t border-line pt-6">
              <p className="font-display text-2xl font-extrabold">{t.name}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-ink-soft">{t.college}</p>
              <p className="mt-3 inline-block bg-brand px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">{t.status}</p>
            </figcaption>
          </div>
        </div>
      </div>
    </Tilt>
  )
}

function Card({ t }) {
  return (
    <Tilt as="article" className="relative flex flex-col border border-line border-t-4 border-t-brand bg-white p-7 hover:shadow-2xl">
      <QuoteMark className="absolute right-6 top-6 h-12 w-12 text-brand/30" />
      <div className="flex items-center gap-4">
        <Avatar t={t} className="h-20 w-20 shrink-0 rounded-xl shadow-lg [transform:translateZ(40px)]" />
        <div className="[transform:translateZ(18px)]">
          <p className="font-display text-xl font-extrabold leading-tight">{t.name}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{t.college}</p>
          <p className="mt-2 inline-block bg-brand px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.12em]">{t.status}</p>
        </div>
      </div>
      <div className="mt-6 [transform:translateZ(14px)]">
        <Stars count={t.rating} />
      </div>
      <blockquote className="mt-4 flex-1 leading-relaxed text-ink-soft [transform:translateZ(10px)]">&ldquo;{t.quote}&rdquo;</blockquote>
    </Tilt>
  )
}

export function Testimonials() {
  const [featured, ...rest] = TESTIMONIALS

  return (
    <section id="testimonials" className="scroll-mt-20 bg-paper-2 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow="Student testimonials"
          title="In their own words."
          subtitle="Real students and parents on what changed once they had clear, personal guidance."
          art={<QuoteArt className="max-w-[14rem]" />}
        />
        {featured ? <Featured t={featured} /> : null}
        {rest.length ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {rest.map((t) => (
              <Card key={t.name} t={t} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
