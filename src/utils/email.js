import { SITE } from '../config/site'

/** Plain mailto link with only our address filled in. On a phone it opens the mail app (Gmail on most Android phones). */
export function mailtoUrl() {
  return `mailto:${SITE.email}`
}

/** Gmail's web "compose" window with only our address in the To field. Used on laptops and desktops. */
function gmailComposeUrl() {
  const q = new URLSearchParams({ view: 'cm', fs: '1', to: SITE.email })
  return `https://mail.google.com/mail/?${q.toString()}`
}

function isPhoneOrTablet() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches
}

/**
 * Click handler for email links. Phones keep the normal mail-app link. On a laptop or desktop
 * (where a mailto link does nothing unless a mail app is installed) it opens Gmail in a new tab.
 */
export function onEmailClick(e) {
  if (isPhoneOrTablet()) return
  e.preventDefault()
  window.open(gmailComposeUrl(), '_blank', 'noopener,noreferrer')
}
