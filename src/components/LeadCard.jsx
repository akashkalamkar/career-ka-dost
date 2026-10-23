import { useState } from 'react'
import { SITE } from '../config/site'
import { btnPrimary } from '../config/ui'
import { buildLeadMessage, EMPTY_LEAD } from '../utils/lead'
import { submitLead } from '../utils/submitLead'
import { openWhatsApp } from '../utils/whatsapp'
import { LeadFields } from './LeadFields'
import { CapIcon, LockIcon } from './icons'

/**
 * THE booking form. The same component is used for the pop-up and for the Contact page,
 * so both always look and behave exactly the same.
 *
 * @param {{ source: 'lead-form' | 'lead-modal', idPrefix: string, onSubmitted?: () => void, onClose?: () => void, titleId?: string }} props
 */
export function LeadCard({ source, idPrefix, onSubmitted, onClose, titleId }) {
  const [values, setValues] = useState(EMPTY_LEAD)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    submitLead({ source, ...values })
    openWhatsApp({ phoneE164: SITE.whatsappE164, message: buildLeadMessage(SITE.name, values) })
    onSubmitted?.()
  }

  if (submitted) {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-2xl" role="status">
        <div className="border-t-8 border-brand p-8 md:p-10">
          <p id={titleId} className="font-display text-3xl font-extrabold">Thank you. You&rsquo;re all set.</p>
          <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
            We&rsquo;ve opened WhatsApp with your details. If it didn&rsquo;t open, use the green WhatsApp button and our team will
            respond shortly.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <button
              type="button"
              className="text-sm font-bold underline decoration-brand decoration-2 underline-offset-4"
              onClick={() =>
                openWhatsApp({
                  phoneE164: SITE.whatsappE164,
                  message: `Follow-up: ${values.studentName}, ${values.phone}, ${values.email}`,
                })
              }
            >
              Open WhatsApp again
            </button>
            {onClose ? (
              <button type="button" className={btnPrimary} onClick={onClose}>
                Close
              </button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
      <div className="flex items-center gap-4 border-b border-line border-t-8 border-t-brand bg-paper-2 px-6 py-6 pr-16 md:px-10">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-ink shadow-[0_3px_0_0_#b97f00]">
          <CapIcon className="h-6 w-6" />
        </span>
        <div>
          <p id={titleId} className="font-display text-xl font-extrabold leading-tight md:text-2xl">
            Book counselling
          </p>
          <p className="mt-0.5 text-sm leading-snug text-ink-soft">
            Career guidance for every student: Class 9 to 12, engineering, medical, Law, BBA, MBA, B.Sc, BCA and more.
          </p>
        </div>
      </div>
      <div className="grid gap-6 p-6 md:p-10">
        <LeadFields idPrefix={idPrefix} values={values} onChange={handleChange} />
        <div>
          <button type="submit" className={`${btnPrimary} w-full !rounded-lg`}>
            Book counselling
          </button>
          <p className="mt-4 flex items-center gap-2 text-xs text-mute">
            <LockIcon className="h-4 w-4 shrink-0" />
            All fields are required. By submitting, you agree to be contacted about counselling services.
          </p>
        </div>
      </div>
    </form>
  )
}
