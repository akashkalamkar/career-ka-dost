import { trackEvent } from '../utils/analytics'
import { WhatsAppIcon } from './icons'

/**
 * "Share on WhatsApp" - opens WhatsApp with a ready message and the page link, so students and parents can
 * forward an article, a checklist or their quiz result. No phone number: the visitor chooses who to send it to.
 */
export function ShareWhatsApp({ text, url, label = 'Share on WhatsApp', what = 'page', className = '' }) {
  const href = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('share_whatsapp', { what })}
      className={`inline-flex items-center gap-2 border-2 border-[#1b9e57] bg-white px-4 py-2 text-sm font-bold text-[#137a43] transition hover:bg-[#25d366]/15 print:hidden ${className}`}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {label}
    </a>
  )
}
