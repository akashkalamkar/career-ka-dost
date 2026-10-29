import { useState } from 'react'
import { PRICING_CATEGORIES, SERVICE_FINDER } from '../config/pricing'
import { SITE } from '../config/site'
import { btnInk, btnPrimary, container } from '../config/ui'
import { slug } from '../utils/searchIndex'
import { openWhatsApp } from '../utils/whatsapp'
import { CoinsArt } from './Art3D'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'
import { ArrowIcon, WhatsAppIcon } from './icons'

function quote(name) {
  openWhatsApp({ phoneE164: SITE.whatsappE164, message: `Hi ${SITE.name}, I'd like to know the price for: ${name}.` })
}

function Finder() {
  const [active, setActive] = useState(null)
  const current = SERVICE_FINDER.find((f) => f.id === active)

  return (
    <div className="border border-line bg-paper-2 p-6 md:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em]">Not sure which service you need?</p>
      <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight md:text-3xl">Tell us who the session is for.</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" role="group" aria-label="Who is the session for?">
        {SERVICE_FINDER.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => setActive(f.id)}
            className={`border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
              active === f.id ? 'border-brand-deep bg-brand' : 'border-ink/15 bg-white hover:border-brand-deep'
            }`}
          >
            <span className="block font-display text-base font-extrabold leading-tight">{f.label}</span>
            <span className="mt-1 block text-sm text-ink-soft">{f.hint}</span>
          </button>
        ))}
      </div>

      {current ? (
        <div className="mt-6 border-l-4 border-brand bg-white p-5" role="status">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-mute">We suggest</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {current.picks.map((p) => (
              <li key={p} className="bg-brand px-4 py-2 text-sm font-semibold text-ink">
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-soft">Details and pricing are just below. Or tell us your situation and we will point you to the right one.</p>
        </div>
      ) : null}
    </div>
  )
}

function PlanCard({ plan }) {
  const hasPrice = Boolean(plan.price)
  return (
    <Tilt as="article" id={`plan-${slug(plan.name)}`} className="flex flex-col border border-line border-t-4 border-t-brand bg-white p-7 hover:shadow-2xl">
      {plan.tag ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-brass [transform:translateZ(14px)]">{plan.tag}</p> : null}
      <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight [transform:translateZ(28px)]">{plan.name}</h3>
      {plan.note ? <p className="mt-1 text-base font-bold text-brass [transform:translateZ(20px)]">{plan.note}</p> : null}
      <p className="mt-2 text-sm font-semibold text-ink-soft">For: {plan.for}</p>
      <p className="mt-4 leading-relaxed text-ink-soft">{plan.text}</p>

      <ul className="mt-5 space-y-2 border-t border-line pt-5">
        {plan.includes.map((i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-1.5 h-2 w-2 shrink-0 bg-brand" aria-hidden />
            {i}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <div className="[transform:translateZ(30px)]">
          {hasPrice ? (
            <p className="font-display text-3xl font-extrabold">
              {plan.price}
              <span className="ml-2 text-sm font-semibold text-mute">{plan.unit}</span>
            </p>
          ) : (
            <p className="font-display text-xl font-extrabold">Price on request</p>
          )}
        </div>
        <button type="button" onClick={() => quote(plan.note ? `${plan.name} ${plan.note}` : plan.name)} className={`${hasPrice ? btnPrimary : btnInk} mt-4 w-full`}>
          <WhatsAppIcon className="h-4 w-4" />
          {hasPrice ? 'Book this service' : 'Get a quote'}
        </button>
      </div>
    </Tilt>
  )
}

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow="Services and pricing"
          title="Clear services. Honest pricing."
          subtitle="Pick the service that fits your situation. We will confirm the fee for any service with you before you pay."
          art={<CoinsArt />}
        />

        <Finder />

        <nav className="mt-14 flex flex-wrap gap-3" aria-label="Service categories">
          {PRICING_CATEGORIES.map((c) => (
            <a key={c.id} href={`#pricing-${c.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`pricing-${c.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="border border-ink/20 bg-white px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand-deep hover:bg-brand">
              {c.title}
            </a>
          ))}
        </nav>

        {PRICING_CATEGORIES.map((c) => (
          <div key={c.id} id={`pricing-${c.id}`} className="mt-10 scroll-mt-28 first:mt-0 md:mt-14">
            <div className="mb-8 flex flex-col gap-1 border-b-2 border-brand pb-4 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-3xl font-extrabold tracking-tight">{c.title}</h2>
              <p className="text-ink-soft">{c.blurb}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {c.plans.map((p) => (
                <PlanCard key={p.name} plan={p} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { t: 'No hidden costs', d: 'We confirm the fee with you before you pay.', href: '#/contact', cta: 'Ask a question' },
            { t: 'Know the rules', d: 'Read how cancellations and refunds work.', href: '#/refund-policy', cta: 'Refund policy' },
            { t: 'Still have doubts?', d: 'Most questions are answered in our FAQ.', href: '#/faq', cta: 'Read the FAQ' },
          ].map((x) => (
            <a key={x.t} href={x.href} className="group border border-line bg-white p-6 transition hover:-translate-y-1 hover:border-brand-deep hover:shadow-xl">
              <p className="font-display text-xl font-extrabold">{x.t}</p>
              <p className="mt-2 text-ink-soft">{x.d}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                {x.cta}
                <ArrowIcon className="h-5 w-5 transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
