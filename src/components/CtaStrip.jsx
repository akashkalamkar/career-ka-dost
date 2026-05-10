import { SITE } from '../config/site'
import { openWhatsApp } from '../utils/whatsapp'

export function CtaStrip() {
  const msg = `Hi ${SITE.name}, I'd like a quick call back about counselling.`

  return (
    <section aria-label="Call to action" className="border-y border-brand-100 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-600 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:flex-row md:justify-between md:text-left md:px-6">
        <div className="max-w-xl">
          <p className="text-lg font-bold text-white md:text-xl">Still scrolling at midnight before choice filling?</p>
          <p className="mt-2 text-sm text-white/85 md:text-base">
            Stop wrestling cutoffs alone—get a calm, expert plan on WhatsApp today.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end md:w-auto">
          <a
            href="#lead-form"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-lg transition hover:bg-brand-50 active:scale-[0.98]"
          >
            Book Free Counselling
          </a>
          <button
            type="button"
            onClick={() => openWhatsApp({ phoneE164: SITE.whatsappE164, message: msg })}
            className="inline-flex items-center justify-center rounded-full border-2 border-white/80 bg-transparent px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
          >
            WhatsApp Us
          </button>
        </div>
      </div>
    </section>
  )
}
