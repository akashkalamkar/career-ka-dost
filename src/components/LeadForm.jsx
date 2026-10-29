import { SITE } from '../config/site'
import { container } from '../config/ui'
import { mailtoUrl, onEmailClick } from '../utils/email'
import { PinArt } from './Art3D'
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon } from './icons'
import { LeadCard } from './LeadCard'
import { MapEmbed } from './MapEmbed'
import { SectionHeading } from './SectionHeading'
import { SocialLinks } from './SocialLinks'
import { Tilt } from './Tilt'
import { useT } from '../i18n'

const link = 'underline decoration-brand decoration-2 underline-offset-4 hover:bg-brand'

function InfoCard({ icon: Icon, label, children }) {
  return (
    <Tilt max={7} className="flex gap-4 border border-line border-l-4 border-l-brand bg-white p-5 hover:shadow-xl">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand text-ink shadow-[0_3px_0_0_#b97f00] [transform:translateZ(30px)]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="[transform:translateZ(14px)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-mute">{label}</p>
        <div className="mt-1.5 leading-relaxed text-ink">{children}</div>
      </div>
    </Tilt>
  )
}

export function LeadForm() {
  const t = useT()
  return (
    <section id="lead-form" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow={t('Contact us')}
              title={t('Book your counselling.')}
              subtitle={t("Tell us a little about you and we'll reply on WhatsApp. No spam, just one focused conversation about your next step.")}
            />
            <div className="space-y-4">
              <InfoCard icon={PhoneIcon} label={t('Call')}>
                <a className={`${link} whitespace-nowrap`} href={`tel:${SITE.phoneTel}`}>
                  {SITE.phoneDisplay}
                </a>
                ,{' '}
                <a className={`${link} whitespace-nowrap`} href={`tel:${SITE.phoneTel2}`}>
                  {SITE.phoneDisplay2}
                </a>
              </InfoCard>
              <InfoCard icon={MailIcon} label={t('Email')}>
                <a className={link} href={mailtoUrl()} onClick={onEmailClick}>
                  {SITE.email}
                </a>
              </InfoCard>
              <InfoCard icon={PinIcon} label={t('Visit us')}>
                {SITE.addressLine}
              </InfoCard>
              <InfoCard icon={InstagramIcon} label={t('Follow and message us')}>
                <SocialLinks className="mt-2" />
              </InfoCard>
            </div>
          </div>

          <div className="lg:col-span-7">
            <LeadCard source="lead-form" idPrefix="lead-" />
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <SectionHeading eyebrow={t('Find us')} title={t('Visit our office in Sitabuldi, Nagpur.')} art={<PinArt className="max-w-[15rem]" />} />
          <MapEmbed />
        </div>
      </div>
    </section>
  )
}
