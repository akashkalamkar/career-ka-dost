import { SITE } from '../config/site'
import { mailtoUrl, onEmailClick } from '../utils/email'
import { GmailIcon, InstagramIcon, LinkedInIcon, PhoneIcon, WhatsAppIcon, YouTubeIcon } from './icons'

const INSTAGRAM_GRADIENT = 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)'

/**
 * All places to reach us, each in the colours of its own logo.
 * Entries without a URL (for example LinkedIn, until you add it) are skipped.
 */
function socialLinks() {
  return [
    { label: 'WhatsApp', href: `https://wa.me/${SITE.whatsappE164}`, icon: WhatsAppIcon, external: true, tile: 'bg-[#25d366] text-white' },
    { label: 'Call us', href: `tel:${SITE.phoneTel}`, icon: PhoneIcon, tile: 'bg-[#1b9e57] text-white' },
    { label: 'Instagram', href: SITE.instagramUrl, icon: InstagramIcon, external: true, tile: 'text-white', style: { background: INSTAGRAM_GRADIENT } },
    { label: 'YouTube', href: SITE.youtubeUrl, icon: YouTubeIcon, external: true, tile: 'bg-[#ff0000] text-white' },
    { label: 'LinkedIn', href: SITE.linkedinUrl, icon: LinkedInIcon, external: true, tile: 'bg-[#0a66c2] text-white' },
    { label: 'Email', href: mailtoUrl(), icon: GmailIcon, onClick: onEmailClick, tile: 'border border-line bg-white', big: true },
  ].filter((l) => l.href)
}

/** Row of round-corner icon buttons in the original colours of each logo. */
export function SocialLinks({ className = '' }) {
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {socialLinks().map(({ label, href, icon: Icon, external, onClick, tile, style, big }) => (
        <li key={label}>
          <a
            href={href}
            onClick={onClick}
            aria-label={label}
            title={label}
            style={style}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-md transition hover:-translate-y-1 hover:shadow-xl ${tile}`}
          >
            <Icon className={big ? 'h-7 w-7' : 'h-6 w-6'} />
          </a>
        </li>
      ))}
    </ul>
  )
}
