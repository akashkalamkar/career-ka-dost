import { useId } from 'react'
import { SITE } from '../config/site'
import { TESTIMONIALS } from '../config/testimonials'
import { container } from '../config/ui'
import { QuoteArt } from './Art3D'
import { SectionHeading } from './SectionHeading'

/**
 * Student testimonials, each card drawn like the Canva "Student Testimonial" design (same colours, Poppins for
 * the heading and Open Sans for the text). The cards move slowly from left to right on their own and stop
 * while the mouse is on them. Data: src/config/testimonials.js (rating can be 4.5 - a half star is shown).
 */

const YELLOW = '#ffd51e'
const BEIGE = '#e0e0cb'
const STAR = '#ffb600'
const PAPER = '#f6f6f6'
const body = { fontFamily: "'Open Sans', sans-serif" }
const heading = { fontFamily: "'Poppins', sans-serif" }

const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z'

/** Full, half or empty star. */
function Star({ fill }) {
  const id = useId()
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      {fill === 'half' ? (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor={STAR} />
            <stop offset="50%" stopColor={BEIGE} />
          </linearGradient>
        </defs>
      ) : null}
      <path d={STAR_PATH} fill={fill === 'full' ? STAR : fill === 'half' ? `url(#${id})` : BEIGE} />
    </svg>
  )
}

function Stars({ rating = 5 }) {
  const stars = [1, 2, 3, 4, 5].map((n) => (rating >= n ? 'full' : rating >= n - 0.5 ? 'half' : 'empty'))
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {stars.map((f, i) => (
        <Star key={i} fill={f} />
      ))}
    </span>
  )
}

function QuoteMark({ className = '', flip = false }) {
  return (
    <svg viewBox="0 0 64 48" className={className} fill={BEIGE} aria-hidden style={flip ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="M0 48V28C0 12 8 2 24 0l2 8C17 10 13 15 13 22h13v26H0Zm38 0V28C38 12 46 2 62 0l2 8c-9 2-13 7-13 14h13v26H38Z" />
    </svg>
  )
}

/** Placeholder picture (sky, cloud and hills, like the design's empty photo frame) until a real photo is added. */
function DummyPhoto() {
  return (
    <svg viewBox="0 0 120 110" className="h-full w-full" aria-hidden>
      <rect width="120" height="110" fill="#e6f5fd" />
      <ellipse cx="72" cy="24" rx="16" ry="9" fill="#fff" />
      <ellipse cx="60" cy="27" rx="10" ry="7" fill="#fff" />
      <path d="M0 74 Q40 58 78 70 T120 66 V110 H0Z" fill="#bcd956" />
      <path d="M0 92 Q50 74 120 84 V110 H0Z" fill="#8ca000" />
    </svg>
  )
}

function Card({ t }) {
  return (
    <article className="relative mr-6 flex w-[300px] shrink-0 flex-col overflow-hidden shadow-lg" style={{ ...body, background: PAPER }}>
      {/* yellow bars */}
      <span className="absolute left-0 top-0 h-[92px] w-[10px]" style={{ background: YELLOW }} aria-hidden />
      <span className="absolute right-0 top-[120px] h-[150px] w-[10px]" style={{ background: YELLOW }} aria-hidden />

      <header className="flex items-start justify-between px-6 pt-5">
        <p className="leading-none text-black" style={heading}>
          <span className="block text-[21px]">Student</span>
          <span className="block text-[26px] font-black tracking-tight">Testimonial</span>
        </p>
        <span className="flex flex-col items-center">
          <img src={SITE.logoSmallUrl} alt="" width={34} height={34} loading="lazy" className="h-[34px] w-[34px] object-contain" />
          <span className="mt-0.5 text-[9px] font-bold leading-none text-black" style={heading}>
            Career Ka <span style={{ color: STAR }}>Dost</span>
          </span>
          <span className="mt-0.5 text-[5px] font-bold uppercase tracking-wider text-black/70">Ask before you decide</span>
        </span>
      </header>

      {/* beige frame */}
      <div className="relative mx-4 mb-3 mt-4 flex-1 rounded-[18px] border-[6px] px-3 pb-7 pt-3" style={{ borderColor: BEIGE }}>
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <QuoteMark className="h-7 w-9" />
            <p className="mt-4 text-[16px] font-bold leading-tight text-black">{t.name}</p>
            <p className="mt-1 text-[10px] uppercase italic leading-snug text-black">{t.college}</p>
            <p className="text-[10px] italic text-black">{t.status}</p>
          </div>
          <div className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[14px]">
            {t.photo ? <img src={t.photo} alt={t.name} loading="lazy" className="h-full w-full object-cover" /> : <DummyPhoto />}
          </div>
        </div>
        <div className="mt-3">
          <Stars rating={t.rating} />
        </div>
        <blockquote className="mt-2 text-[12px] leading-[1.45] text-black">{t.quote}</blockquote>
        <QuoteMark className="absolute bottom-1.5 right-2 h-6 w-8" flip />
      </div>

      <footer className="flex items-end justify-between px-5 pb-3">
        <p className="text-[9px] font-bold text-black">
          Get in Touch | <span aria-hidden>&#9742;</span> {SITE.phoneDisplay.replace('+91 ', '')}
        </p>
        <span className="grid grid-cols-4 gap-x-1 text-[11px] font-black leading-none" style={{ color: '#f7c04a' }} aria-hidden>
          <span />
          <span />
          <span />
          <span>&times;</span>
          <span>&times;</span>
          <span>&times;</span>
          <span>&times;</span>
          <span>&times;</span>
        </span>
      </footer>
    </article>
  )
}

export function Testimonials() {
  // The list is shown twice in a row so the movement loops without a gap; the copy is hidden from screen readers.
  const seconds = Math.max(TESTIMONIALS.length * 9, 30)
  return (
    <section id="testimonials" className="scroll-mt-20 bg-paper-2 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow="Student testimonials"
          title="In their own words."
          subtitle="Real students and parents on what changed once they had clear, personal guidance."
          art={<QuoteArt className="max-w-[14rem]" />}
        />
      </div>
      <div className="mt-4 overflow-hidden motion-reduce:overflow-x-auto">
        <div className="ckd-marquee flex w-max items-stretch py-4" style={{ '--marquee-duration': `${seconds}s` }}>
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} t={t} />
          ))}
          <div className="contents" aria-hidden>
            {TESTIMONIALS.map((t) => (
              <Card key={`copy-${t.name}`} t={t} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center">
        <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-brand decoration-2 underline-offset-4">
          Read all our reviews on Google (rated 4.9)
        </a>
      </p>
    </section>
  )
}
