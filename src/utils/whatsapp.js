/** @param {{ phoneE164: string; message: string }} opts */
export function openWhatsApp(opts) {
  const url = `https://wa.me/${opts.phoneE164}?text=${encodeURIComponent(opts.message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
