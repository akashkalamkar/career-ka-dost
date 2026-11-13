import { HUB } from '../config/hub'
import { POSTS } from '../config/blog'
import { PRICING_CATEGORIES } from '../config/pricing'
import { SERVICES } from '../config/services'
import { SITE } from '../config/site'
import { GOOGLE_REVIEWS } from '../config/testimonials'
import { btnInk, btnPrimary, container } from '../config/ui'
import { bookProps } from '../utils/leadForm'
import { openWhatsApp } from '../utils/whatsapp'
import { RichText } from './BlogPost'
import { ArrowIcon, WhatsAppIcon } from './icons'

const REVIEW_NAMES = ['Prajwal Gaikwad', 'Vedanshi Tamrakar', 'Kushal Humane']
const GUIDES = [
  'career-counselling-in-nagpur-how-to-choose-a-career-counsellor',
  'how-to-choose-a-stream-after-class-10',
  'career-options-after-12th-science-pcm-pcb',
  'what-is-a-psychometric-test',
]

/** Current fee of a plan: the price, or "On request". */
function feeOf(plan) {
  if (plan.price) return `${plan.price}${plan.unit ? ` ${plan.unit}` : ''}`
  return 'Get a quote'
}

/** The main "Career Counselling in Nagpur" page: what we do, every service, how it works, the office, fees, reviews and FAQs. */
export function NagpurHub() {
  const plans = PRICING_CATEGORIES.flatMap((c) => c.plans)
  const reviews = REVIEW_NAMES.map((n) => GOOGLE_REVIEWS.find((r) => r.name === n)).filter(Boolean)
  const guides = GUIDES.map((g) => POSTS.find((p) => p.slug === g)).filter(Boolean)
  const ask = () => openWhatsApp({ phoneE164: SITE.whatsappE164, message: `Hi ${SITE.name}, I'd like to know about career counselling in Nagpur.` })

  return (
    <article>
      <section className="bg-paper-2 py-16 md:py-24">
        <div className={container}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brass">Sitabuldi, Nagpur · Online across India</p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">{HUB.h1}</h1>
          {HUB.intro.map((t) => (
            <p key={t} className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {t}
            </p>
          ))}
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
        <div className={`${container} max-w-4xl space-y-16`}>
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Career guidance in Nagpur: your career consultant and counsellor</h2>
            {HUB.consultant.map((t) => (
              <p key={t} className="mt-5 text-lg leading-relaxed text-ink-soft">
                {t}
              </p>
            ))}
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">What is career counselling, and who needs it?</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Career counselling helps a student understand their interests, strengths and goals, look at the real options in front of them, and make a plan they can follow. It is not one person telling a child what to become. A good counsellor gives facts, asks the right questions and involves parents, so the decision belongs to the family. Students and parents in Nagpur usually come to us:
            </p>
            <ul className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
              {HUB.whoNeeds.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-3 h-2 w-2 shrink-0 bg-brand" aria-hidden />
                  <span>
                    <RichText text={t} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Our career counselling services in Nagpur</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">Each service has its own page with how it works, the fee and answers to common questions.</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {SERVICES.map((sv) => (
                <li key={sv.slug}>
                  <a href={`/${sv.slug}`} className="flex h-full flex-col border border-line border-t-4 border-t-brand bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-brass">{sv.eyebrow}</span>
                    <span className="mt-2 font-display text-lg font-extrabold leading-snug">{sv.menu}</span>
                    <span className="mt-2 flex-1 text-sm text-ink-soft">{sv.description}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                      Know more <ArrowIcon className="h-4 w-4" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Career counselling for students in Nagpur, by need</h2>
            <div className="mt-6 space-y-8">
              {HUB.byNeed.map(([name, text]) => (
                <div key={name}>
                  <h3 className="font-display text-xl font-extrabold">{name}</h3>
                  <p className="mt-2 text-lg leading-relaxed text-ink-soft">
                    <RichText text={text} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Our counselling sessions</h2>
            <div className="mt-6 space-y-8">
              {HUB.sessions.map(([name, text]) => (
                <div key={name}>
                  <h3 className="font-display text-xl font-extrabold">{name}</h3>
                  <p className="mt-2 text-lg leading-relaxed text-ink-soft">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">How a career counselling session works</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {HUB.steps.map(([title, text], i) => (
                <li key={title} className="border border-line border-l-4 border-l-brand bg-white p-5">
                  <p className="font-display text-sm font-extrabold text-brass">Step {i + 1}</p>
                  <p className="mt-1 font-display text-lg font-extrabold">{title}</p>
                  <p className="mt-1 text-ink-soft">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Assessments: psychometric test and DMIT</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Where it helps, we use a <a href="/career-test" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">psychometric aptitude test and a career interest inventory</a>, and we offer <a href="/dmit-test-nagpur" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">DMIT test and report counselling</a>. Any assessment is one input alongside marks, interests and a proper conversation, never the only basis for a decision. Read our guide to <a href="/blog/dmit-vs-psychometric-test-which-to-choose" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">DMIT vs psychometric test</a> before you choose.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Career counselling fees in Nagpur</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {plans.map((p) => (
                <li key={p.name} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                  <span className="font-display text-lg font-extrabold">{p.name}</span>
                  <span className="font-semibold text-ink-soft">{feeOf(p)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-ink-soft">
              Every fee is confirmed with you before you pay. See <a href="/pricing" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">all services and fees</a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Career counselling in Sitabuldi, Nagpur: visit our office</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              {SITE.addressLine}. We are in the centre of Nagpur, opposite Fortune Mall. {SITE.hoursText}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              {HUB.areas}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Call <a className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4" href={`tel:${SITE.phoneTel}`}>{SITE.phonePretty}</a>, message us on WhatsApp, or{' '}
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">open our location in Google Maps</a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">How to choose the best career counselling in Nagpur</h2>
            {HUB.chooseBest.map((t) => (
              <p key={t} className="mt-5 text-lg leading-relaxed text-ink-soft">
                <RichText text={t} />
              </p>
            ))}
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Students from across Maharashtra</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Many families we guide live outside Nagpur, in Bhandara, Chandrapur, Wardha, Gondia, Amravati and other towns. They either visit our Sitabuldi office or take the full session online. See our pages for <a href="/career-counselling-vidarbha" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">students from Vidarbha and beyond</a> and <a href="/online-career-counselling-maharashtra" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">online career counselling across India</a>.
            </p>
          </div>

          {reviews.length ? (
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">What families say on Google</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
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
              <p className="mt-4">
                <a href="/results#google-reviews" className="font-bold underline decoration-brand decoration-2 underline-offset-4">
                  Read more reviews
                </a>
              </p>
            </div>
          ) : null}

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Common questions about career counselling in Nagpur</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {HUB.faqs.map(([q, a]) => (
                <div key={q} className="py-5">
                  <h3 className="font-display text-lg font-extrabold">{q}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {guides.length ? (
            <nav aria-label="Guides for parents">
              <h2 className="font-display text-3xl font-extrabold tracking-tight">Guides for students and parents</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {guides.map((p) => (
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
      </section>
    </article>
  )
}
