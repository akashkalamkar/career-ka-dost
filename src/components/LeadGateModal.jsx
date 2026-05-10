import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IMAGES, IMAGE_FALLBACKS } from '../config/images'
import { SITE } from '../config/site'
import { openWhatsApp } from '../utils/whatsapp'
import { PosterImage } from './PosterImage'

const STORAGE_KEY = 'ckd_lead_gate_done'

function readDismissed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function persistDismissed() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

const initial = {
  studentName: '',
  phone: '',
  email: '',
  classExam: '',
  city: '',
}

const fieldClass =
  'h-11 w-full rounded-xl border border-slate-200/90 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm sm:normal-case sm:tracking-normal'

function WhatsAppGlyph({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function LeadGateModal() {
  const dialogLabelId = useId()
  const closeRef = useRef(null)
  const [open, setOpen] = useState(() => !readDismissed())
  const [values, setValues] = useState(initial)

  const dismiss = useCallback(() => {
    persistDismissed()
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  function handleChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const msg = [
      `Hi ${SITE.name}, I'd like to book a free counselling session.`,
      `Student name: ${values.studentName}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      `Class / Exam: ${values.classExam}`,
      `City: ${values.city}`,
    ].join('\n')

    openWhatsApp({ phoneE164: SITE.whatsappE164, message: msg })
    persistDismissed()
    setOpen(false)
    setValues(initial)
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4 md:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-colors"
        aria-label="Close dialog"
        onClick={dismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogLabelId}
        className="relative z-[101] flex min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-2xl shadow-[0_25px_80px_-12px_rgba(15,23,42,0.45)] ring-1 ring-white/10 sm:rounded-3xl md:flex-row"
        style={{ height: 'min(calc(100dvh - 1.25rem), 52rem)' }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 z-[120] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-lg transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:right-3 sm:top-3 md:right-4 md:top-4"
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* Left: bg anchored on <aside> (full column height). Inner wrapper was shorter → exposed flat bg as a “blue bar”. */}
        <aside className="relative isolate flex min-h-0 w-full max-h-[min(38vh,300px)] shrink-0 flex-col overflow-hidden md:max-h-none md:h-full md:w-[44%] lg:w-[42%]">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
            <PosterImage
              src={IMAGES.leadBanner}
              fallback={IMAGE_FALLBACKS.leadBanner}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 block h-full w-full object-cover object-center opacity-[0.48] [transform:translateZ(0)_scale(1.12)]"
              priority
            />
            {/* Bottom tint matches gradient end (brand-950) so no harsh flat strip */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-brand-800/85 via-brand-900/88 to-brand-950" />
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-11 text-white [-webkit-overflow-scrolling:touch] sm:px-6 md:h-full md:px-8 md:pb-10 md:pt-14">
              <div className="space-y-4 md:space-y-5">
                <div className="rounded-xl bg-brand-950/35 p-4 ring-1 ring-white/10 md:bg-transparent md:p-0 md:ring-0">
                    <p
                      id={dialogLabelId}
                      className="text-pretty text-lg font-bold leading-snug tracking-tight sm:text-xl md:text-2xl"
                    >
                      Confused About NEET or Engineering Admission?
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/95">
                      Get expert counselling to choose the best college based on your marks, rank, budget and career goals.
                    </p>
                    <span className="mt-4 inline-flex rounded-full border border-white/30 bg-white/20 px-4 py-2 text-xs font-semibold text-white sm:text-sm">
                      Book Free Counselling
                    </span>
                </div>

                <div className="border-t border-white/25 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold md:text-lg">{SITE.name}</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-600/25 px-3 py-1 text-xs font-semibold text-white">
                        <WhatsAppGlyph className="h-3.5 w-3.5" />
                        WhatsApp Now
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/90">
                      Join hundreds of families who traded confusion for a clear admission game-plan.
                    </p>
                    <p className="mt-2 text-xs leading-snug text-white/75">Trusted by students & parents</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: form — only scrollable column; fills remaining modal height */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-slate-200/60 bg-gradient-to-br from-white via-slate-50/98 to-brand-50/40 md:border-l md:border-t-0 md:w-[56%] lg:w-[58%]">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-gutter:stable] px-5 pb-6 pt-14 sm:px-6 sm:pb-8 sm:pt-16 md:px-8 md:pb-10 md:pt-14 md:pl-7">
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex w-full max-w-md flex-col gap-3.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-4 md:max-w-none md:gap-5"
            >
              <div className="space-y-1">
                <label htmlFor="gate-studentName" className={labelClass}>
                  Student name
                </label>
                <input
                  id="gate-studentName"
                  name="studentName"
                  required
                  autoComplete="name"
                  value={values.studentName}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="gate-phone" className={labelClass}>
                  Phone number
                </label>
                <input
                  id="gate-phone"
                  name="phone"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="10-digit mobile"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="gate-email" className={labelClass}>
                  Email id
                </label>
                <input
                  id="gate-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="gate-classExam" className={labelClass}>
                  Class / Exam
                </label>
                <input
                  id="gate-classExam"
                  name="classExam"
                  required
                  value={values.classExam}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="e.g. NEET 2026 / Class 12 PCM / JEE"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="gate-city" className={labelClass}>
                  City
                </label>
                <input
                  id="gate-city"
                  name="city"
                  required
                  autoComplete="address-level2"
                  value={values.city}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="Your city"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-4 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:from-brand-700 hover:to-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.99] sm:text-base"
                >
                  Book Free Session
                </button>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                  By submitting, you agree to be contacted about counselling services.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  )
}
