import { useState } from 'react'
import { IMAGES, IMAGE_FALLBACKS } from '../config/images'
import { SITE } from '../config/site'
import { openWhatsApp } from '../utils/whatsapp'
import { PosterImage } from './PosterImage'
import { SectionHeading } from './SectionHeading'

const initial = {
  studentName: '',
  phone: '',
  email: '',
  classExam: '',
  city: '',
}

export function LeadForm() {
  const [values, setValues] = useState(initial)
  const [submitted, setSubmitted] = useState(false)

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

    setSubmitted(true)
    openWhatsApp({ phoneE164: SITE.whatsappE164, message: msg })
  }

  return (
    <section id="lead-form" className="scroll-mt-24 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Book your free session"
          title="Tell us about you—we’ll reply on WhatsApp"
          subtitle="No spam. Just a focused conversation to guide NEET/JEE engineering admissions or career planning after 10th/12th."
        />
        <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-slate-200/80 md:grid md:grid-cols-5">
          <div className="relative hidden min-h-[280px] overflow-hidden bg-brand-800 md:col-span-2 md:block">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <PosterImage
                src={IMAGES.leadBanner}
                fallback={IMAGE_FALLBACKS.leadBanner}
                alt="Students preparing for a brighter career future"
                className="absolute left-1/2 top-1/2 block min-h-full min-w-full max-w-none object-cover object-center [transform:translate(-50%,-50%)_scale(0.88)]"
              />
            </div>
            <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
              <div className="max-w-md rounded-xl border border-white/70 bg-white/92 px-4 py-3 shadow-lg shadow-slate-900/10 backdrop-blur-[2px] md:px-5 md:py-4">
                <p className="text-lg font-bold text-slate-900">{SITE.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Join hundreds of families who traded confusion for a clear admission game-plan.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-brand-50 via-white to-accent-400/10 p-6 md:col-span-3 md:p-10">
            {submitted ? (
              <div
                className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900"
                role="status"
              >
                <p className="text-lg font-bold">You’re all set!</p>
                <p className="mt-2 text-sm leading-relaxed">
                  We’ve opened WhatsApp with your details. If it didn’t open, tap the green WhatsApp button—our team will
                  respond shortly.
                </p>
                <button
                  type="button"
                  className="mt-4 text-sm font-semibold text-green-800 underline"
                  onClick={() =>
                    openWhatsApp({
                      phoneE164: SITE.whatsappE164,
                      message: `Follow-up: ${values.studentName}, ${values.phone}, ${values.email}`,
                    })
                  }
                >
                  Open WhatsApp again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-semibold text-slate-700">
                    Student name
                  </label>
                  <input
                    id="studentName"
                    name="studentName"
                    required
                    autoComplete="name"
                    value={values.studentName}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                    placeholder="10-digit mobile"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Email id
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="classExam" className="block text-sm font-semibold text-slate-700">
                    Class / Exam
                  </label>
                  <input
                    id="classExam"
                    name="classExam"
                    required
                    value={values.classExam}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                    placeholder="e.g. NEET 2026 / Class 12 PCM / JEE"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-slate-700">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    required
                    autoComplete="address-level2"
                    value={values.city}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                    placeholder="Your city"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 active:scale-[0.99]"
                >
                  Book Free Session
                </button>
                <p className="text-center text-xs text-slate-500">
                  By submitting, you agree to be contacted about counselling services.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
