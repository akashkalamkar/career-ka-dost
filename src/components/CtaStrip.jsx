import { SITE } from '../config/site'
import { btnInk, container } from '../config/ui'
import { bookProps } from '../utils/leadForm'
import { openWhatsApp } from '../utils/whatsapp'

export function CtaStrip() {
  const msg = `Hi ${SITE.name}, I'd like a quick call back about counselling.`

  return (
    <section aria-label="Call to action" className="bg-brand text-ink">
      <div className={`${container} flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20`}>
        <div className="max-w-xl">
          <p className="font-display text-3xl font-extrabold leading-tight md:text-4xl">Every great career starts with one conversation.</p>
          <p className="mt-4 text-ink/75">Talk to a counsellor who listens first, and leave with a clear, confident plan for your next step.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a {...bookProps} className={btnInk}>
            Book counselling
          </a>
          <button type="button" onClick={() => openWhatsApp({ phoneE164: SITE.whatsappE164, message: msg })} className={btnInk}>
            WhatsApp us
          </button>
        </div>
      </div>
    </section>
  )
}
