import { SITE } from '../config/site'
import { container } from '../config/ui'
import { mailtoUrl, onEmailClick } from '../utils/email'
import { Brand } from './Brand'
import { SocialLinks } from './SocialLinks'
import { VisitCounter } from './VisitCounter'
import { GmailIcon, InstagramColorIcon, PhoneIcon, PinColorIcon, WhatsAppIcon } from './icons'

const link = 'whitespace-nowrap underline-offset-4 transition hover:text-ink hover:underline'
const head = 'text-xs font-bold uppercase tracking-[0.2em] text-brass'
const row = 'group flex items-start gap-3 transition hover:text-ink'
const iconWrap = 'flex h-9 w-9 shrink-0 items-center justify-center bg-white text-brass shadow-sm transition group-hover:bg-brand group-hover:text-ink'

const EXPLORE = [
  { label: 'About us', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Career Test', href: '/career-test' },
  { label: 'Results & testimonials', href: '/results' },
  { label: 'Free Resources', href: '/resources' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

const LEGAL = [
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Terms and Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
]

function Row({ icon: Icon, iconClass = '', href, external, onClick, children }) {
  return (
    <li>
      <a className={row} href={href} onClick={onClick} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        <span className={iconWrap}>
          <Icon className={`h-[20px] w-[20px] ${iconClass}`} />
        </span>
        <span className="pt-1.5 leading-snug">{children}</span>
      </a>
    </li>
  )
}

export function Footer() {
  return (
    <footer className="bg-paper-2 font-bold text-ink print:hidden">
      <div className="h-1.5 bg-brand" aria-hidden />
      <div className={`${container} grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <Brand size="lg" showTagline={false} />
          <p className="mt-5 font-display text-lg font-bold uppercase tracking-wide text-ink">{SITE.tagline}</p>
          <p className="mt-3 max-w-sm text-sm font-bold leading-relaxed">
            Career guidance, counselling and admissions support for students and parents.
          </p>
          <SocialLinks className="mt-6" />
        </div>

        <div className="lg:col-span-2">
          <p className={head}>Explore</p>
          <ul className="mt-5 space-y-3 text-sm">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <a className={link} href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className={head}>Contact</p>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className={iconWrap}>
                <PhoneIcon className="h-[20px] w-[20px] text-[#1b9e57]" />
              </span>
              <span className="pt-1.5 leading-snug">
                <a className={link} href={`tel:${SITE.phoneTel}`}>
                  {SITE.phoneDisplay}
                </a>
                ,{' '}
                <a className={link} href={`tel:${SITE.phoneTel2}`}>
                  {SITE.phoneDisplay2}
                </a>
              </span>
            </li>
            <Row icon={WhatsAppIcon} iconClass="text-[#25d366]" href={`https://wa.me/${SITE.whatsappE164}`} external>
              Chat on WhatsApp
            </Row>
            <Row icon={GmailIcon} href={mailtoUrl()} onClick={onEmailClick}>
              {SITE.email}
            </Row>
            <Row icon={InstagramColorIcon} href={SITE.instagramUrl} external>
              @careerkadost
            </Row>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className={head}>Visit</p>
          <ul className="mt-5 space-y-4 text-sm">
            <Row icon={PinColorIcon} href={SITE.mapsUrl} external>
              {SITE.addressLine}
            </Row>
          </ul>
          <div className="group relative mt-6 overflow-hidden border border-line">
            <iframe
              title={`${SITE.name} on Google Maps`}
              src={SITE.mapEmbedUrl}
              loading="lazy"
              tabIndex={-1}
              referrerPolicy="no-referrer-when-downgrade"
              className="pointer-events-none block h-40 w-full border-0"
            />
            {/* Covers the map so one tap opens Google Maps (the Maps app on phones). */}
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Career Ka Dost in Google Maps"
              className="absolute inset-0 flex items-end justify-end bg-brand/0 p-3 transition group-hover:bg-brand/20"
            >
              <span className="bg-brand px-3 py-1.5 text-xs font-bold text-ink shadow">Open in Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className={`${container} flex flex-col gap-4 pb-24 pt-6 text-xs font-bold text-ink-soft md:flex-row md:items-center md:justify-between md:pb-6`}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <p>
              &copy; {SITE.copyrightYear} {SITE.name}. All rights reserved.
            </p>
            <VisitCounter />
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <a className="underline-offset-4 transition hover:text-ink hover:underline" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
