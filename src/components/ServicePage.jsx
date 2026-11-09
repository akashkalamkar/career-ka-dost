import { POSTS } from '../config/blog'
import { PRICING_CATEGORIES } from '../config/pricing'
import { SERVICES } from '../config/services'
import { SITE } from '../config/site'
import { GOOGLE_REVIEWS, TESTIMONIALS } from '../config/testimonials'
import { btnInk, btnPrimary, container } from '../config/ui'
import { bookProps } from '../utils/leadForm'
import { openWhatsApp } from '../utils/whatsapp'
import { ArrowIcon, WhatsAppIcon } from './icons'

/** Which Google reviews to show on which service page: only general or relevant ones, quoted exactly (see testimonials.js). */
const REVIEWS_FOR = {
  'mht-cet-counselling-nagpur': ['Sachi Bhowate', 'Ajay Umredkar'],
  'josaa-counselling-nagpur': ['Ajay Umredkar', 'Aleena Shaikh'],
  'neet-counselling-maharashtra': ['Sarvashree Shinkar', 'Prajwal Gaikwad'],
  'dmit-test-nagpur': ['Sarvashree Shinkar', 'Prajwal Gaikwad'],
  'career-counselling-after-10th-nagpur': ['Vedanshi Tamrakar', 'Kushal Humane'],
  'career-counselling-after-12th-nagpur': ['Aleena Shaikh', 'Kushal Humane'],
  'online-career-counselling-maharashtra': ['Prajwal Gaikwad', 'Vedanshi Tamrakar'],
  'admission-guidance-law-bba-mba-nagpur': ['Vedanshi Tamrakar', 'Kushal Humane'],
  'ayush-counselling-bams-bhms-bums': ['Sarvashree Shinkar', 'Prajwal Gaikwad'],
  'physiotherapy-bpth-admission-guidance': ['Sarvashree Shinkar', 'Prajwal Gaikwad'],
  'career-counselling-vidarbha': ['Prajwal Gaikwad', 'Vedanshi Tamrakar'],
}

const planNamed = (name) => PRICING_CATEGORIES.flatMap((c) => c.plans).find((p) => p.name === name)

/** The fee box: the same price as on the Pricing page (crossed-out original, then the price). */
function Fee({ plan }) {
  const hasPrice = plan && plan.price
  return (
    <div className="border-t-8 border-brand bg-paper-2 p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brass">Fee</p>
      {hasPrice ? (
        <p className="mt-3 flex flex-wrap items-baseline gap-3">
          {plan.originalPrice ? <span className="text-xl font-bold text-mute line-through">{plan.originalPrice}</span> : null}
          <span className="font-display text-4xl font-extrabold">{plan.price}</span>
          {plan.unit ? <span className="text-sm font-semibold text-ink-soft">{plan.unit}</span> : null}
        </p>
      ) : (
        <p className="mt-3 font-display text-xl font-extrabold leading-snug">
          {plan && plan.priceText && plan.priceText !== 'N/A' ? plan.priceText : 'On request - contact us for a quote'}
        </p>
      )}
      <a {...bookProps} className={`${btnPrimary} mt-6 w-full`}>
        Book counselling
      </a>
      <a href="/pricing" className="mt-4 block text-center text-sm font-bold underline decoration-brand decoration-2 underline-offset-4">
        See all services and fees
      </a>
    </div>
  )
}

export function ServicePage({ slug }) {
  const s = SERVICES.find((x) => x.slug === slug)
  if (!s) return null
  const plan = planNamed(s.plan)
  const reviews = (REVIEWS_FOR[slug] || []).map((n) => [...TESTIMONIALS, ...GOOGLE_REVIEWS].find((t) => t.name === n)).filter(Boolean)
  const posts = s.blog.map((b) => POSTS.find((p) => p.slug === b)).filter(Boolean)
  const others = SERVICES.filter((x) => x.slug !== slug)
  const ask = () => openWhatsApp({ phoneE164: SITE.whatsappE164, message: `Hi ${SITE.name}, I'd like to know more about ${s.menu}.` })

  return (
    <article>
      <section className="bg-paper-2 py-16 md:py-24">
        <div className={container}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brass">{s.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">{s.h1}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{s.intro}</p>
          <p className="mt-6 text-sm font-bold">
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline decoration-brand decoration-2 underline-offset-4">
              <span className="text-brass" aria-hidden>
                &#9733;
              </span>
              Rated {SITE.googleRating} on Google by {SITE.googleReviewCount} families
            </a>
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a {...bookProps} className={btnPrimary}>
              Book counselling
            </a>
            <button type="button" onClick={ask} className={btnInk}>
              <WhatsAppIcon className="h-5 w-5" />
              Ask on WhatsApp
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className={`${container} grid gap-12 lg:grid-cols-12`}>
          <div className="space-y-14 lg:col-span-8">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">How we help</h2>
              <ul className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
                {s.help.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span className="mt-3 h-2 w-2 shrink-0 bg-brand" aria-hidden />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">How it works</h2>
              <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                {s.steps.map(([title, text], i) => (
                  <li key={title} className="border border-line border-l-4 border-l-brand bg-white p-5">
                    <p className="font-display text-sm font-extrabold text-brass">Step {i + 1}</p>
                    <p className="mt-1 font-display text-lg font-extrabold">{title}</p>
                    <p className="mt-1 text-ink-soft">{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            {reviews.length ? (
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">What families say on Google</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {reviews.map((t) => (
                    <li key={t.name} className="flex flex-col border border-line border-t-4 border-t-brand bg-white p-5">
                      <span className="text-brass" role="img" aria-label="5 out of 5 stars">
                        &#9733;&#9733;&#9733;&#9733;&#9733;
                      </span>
                      <blockquote className="mt-3 flex-1 leading-relaxed text-ink-soft">&ldquo;{t.quote}&rdquo;</blockquote>
                      <p className="mt-4 text-sm font-bold">{t.name} &middot; Google review</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">Common questions</h2>
              <div className="mt-6 divide-y divide-line border-y border-line">
                {s.faqs.map(([q, a]) => (
                  <div key={q} className="py-5">
                    <h3 className="font-display text-lg font-extrabold">{q}</h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {posts.length ? (
              <nav aria-label="Related articles">
                <h2 className="font-display text-3xl font-extrabold tracking-tight">Related reading</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <a href={`/blog/${p.slug}`} className="flex h-full flex-col border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-deep hover:shadow-lg">
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-brass">{p.category}</span>
                        <span className="mt-2 font-display text-lg font-bold leading-snug">{p.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-28">
              <Fee plan={plan} />
              {s.checklist ? (
                <a href={s.checklist} className="block border-2 border-brand-deep bg-white p-5 transition hover:bg-brand/20">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-brass">Free checklist</span>
                  <span className="mt-1 block font-display text-lg font-extrabold leading-snug">NEET counselling documents list (Maharashtra)</span>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold">
                    Tick, print or share <ArrowIcon className="h-4 w-4" />
                  </span>
                </a>
              ) : null}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em]">Other services</p>
                <ul className="mt-3 divide-y divide-line border-y border-line">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <a href={`/${o.slug}`} className="flex items-center justify-between gap-3 py-3 font-bold hover:text-brass">
                        {o.h1}
                        <ArrowIcon className="h-4 w-4 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </article>
  )
}
