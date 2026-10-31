import { trackEvent } from './analytics'

/** @param {{ phoneE164: string; message: string }} opts */
export function openWhatsApp(opts) {
  const url = `https://wa.me/${opts.phoneE164}?text=${encodeURIComponent(opts.message)}`
  trackEvent('whatsapp_click')
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * A phone number as typed on a bill ("98565 12625", "+91-9856512625", "09856512625") -> "919856512625"
 * for a wa.me link. Only Indian mobile numbers (10 digits starting 6-9) are accepted; anything else
 * returns null so the reminder button can say the number needs checking instead of opening a wrong chat.
 */
export function whatsappNumber(phone) {
  let digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : null
}

export function whatsappLink(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
