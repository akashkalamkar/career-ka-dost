import { FOUNDER, SITE, STATS } from '../config/site'
import { btnOutline, btnPrimary, container } from '../config/ui'
import { bookProps } from '../utils/leadForm'
import { openWhatsApp } from '../utils/whatsapp'
import { BooksArt } from './Art3D'
import { WhatsAppIcon } from './icons'
import { Tilt } from './Tilt'

export function Hero() {
  const waIntro = `Hi ${SITE.name}, I'd like to book a counselling session for career guidance.`

  return (
    <section id="hero">
      <div className={`${container} grid gap-12 pb-16 pt-10 md:pb-20 md:pt-16 lg:grid-cols-12 lg:items-center lg:gap-14`}>
        <div className="lg:col-span-7">
          <p className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-ink">
            <span className="h-1 w-10 bg-brand" aria-hidden />
            {SITE.tagline}
          </p>
          <h1 className="text-balance font-display text-[2.5rem] font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            Your career is too important to{' '}
            <span className="bg-[linear-gradient(transparent_62%,var(--color-brand)_62%)] px-1">leave to chance.</span>
          </h1>
          <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft md:text-xl">
            Honest, one-to-one career and admission counselling for every student, from Class 9 onwards: engineering, medical, law,
            management, science and more. For every family, whatever the marks and whatever the budget.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a {...bookProps} className={btnPrimary}>
              Book counselling
            </a>
            <button
              type="button"
              onClick={() => openWhatsApp({ phoneE164: SITE.whatsappE164, message: waIntro })}
              className={btnOutline}
            >
              <WhatsAppIcon className="h-4 w-4" />
              Message on WhatsApp
            </button>
            <div className="hidden w-32 shrink-0 xl:ml-auto xl:block">
              <BooksArt />
            </div>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <Tilt max={7} lift={1.03} glare={false} className="mx-auto max-w-[26rem]">
            <img
              src={FOUNDER.photo}
              alt={`${FOUNDER.name}, founder of ${SITE.name}`}
              className="block w-full drop-shadow-[0_26px_26px_rgba(0,0,0,0.22)]"
              fetchPriority="high"
            />
          </Tilt>
          <figcaption className="mx-auto mt-2 max-w-[26rem] border-t-4 border-brand pt-4 text-center">
            <p className="font-display text-xl font-extrabold">{FOUNDER.name}</p>
            <p className="mt-1 text-sm text-ink-soft">Founder &middot; Engineer &amp; MBA &middot; Certified Career Counsellor</p>
          </figcaption>
        </figure>
      </div>

      <div className="bg-brand text-ink">
        <dl className={`${container} grid grid-cols-2 lg:grid-cols-4`}>
          {STATS.map((s, i) => (
            <Tilt key={s.label} glare={false} max={10} lift={1.04} className={`px-5 py-8 hover:bg-white/25 ${i > 0 ? 'lg:border-l lg:border-ink/15' : ''}`}>
              <dt className="font-display text-3xl font-extrabold text-ink md:text-4xl [transform:translateZ(34px)]">{s.value}</dt>
              <dd className="mt-2 max-w-[14rem] text-sm font-medium leading-snug text-ink/80 [transform:translateZ(14px)]">{s.label}</dd>
            </Tilt>
          ))}
        </dl>
      </div>
    </section>
  )
}
