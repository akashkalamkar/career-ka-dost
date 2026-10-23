import { SITE } from '../config/site'
import { openWhatsApp } from '../utils/whatsapp'
import { PhoneIcon, WhatsAppIcon } from './icons'

export function FloatingActions() {
  const msg = `Hi ${SITE.name}, I saw your website and want guidance for career counselling.`

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 md:bottom-6 md:right-6">
        <button
          type="button"
          aria-label="Chat on WhatsApp"
          onClick={() => openWhatsApp({ phoneE164: SITE.whatsappE164, message: msg })}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 active:scale-95"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </button>
      </div>
      <div className="fixed bottom-5 left-5 z-50 md:hidden">
        <a
          href={`tel:${SITE.phoneTel}`}
          aria-label={`Call ${SITE.name}`}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-ink shadow-lg transition hover:bg-brand-deep active:scale-95"
        >
          <PhoneIcon className="h-6 w-6" />
        </a>
      </div>
    </>
  )
}
