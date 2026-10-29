import { FOUNDER, SITE } from '../config/site'
import { btnOutline, container } from '../config/ui'
import { openWhatsApp } from '../utils/whatsapp'
import { HowItWorks } from './HowItWorks'
import { MissionVision } from './MissionVision'
import { WhyChooseUs } from './WhyChooseUs'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'
import { useT } from '../i18n'

const inclusive = [
  {
    title: 'Every option on the table',
    text: 'Government, aided and private colleges compared side by side, so you see the full picture.',
  },
  {
    title: 'Budget is part of the plan',
    text: 'We build advice around what your family can realistically afford, and never push the costliest path.',
  },
  {
    title: 'Parents are partners',
    text: 'We guide students and parents at every step, so the whole family decides together.',
  },
]

export function About() {
  const t = useT()
  return (
    <>
      <MissionVision />

      <section id="founder" className="scroll-mt-20 bg-paper-2 py-20 md:py-28">
        <div className={`${container} grid items-center gap-12 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-5">
            <Tilt max={6} lift={1.03} glare={false} className="mx-auto max-w-md">
              <img
                src={FOUNDER.photo}
                alt={t('{name}, founder of {site}', { name: FOUNDER.name, site: SITE.name })}
                loading="lazy"
                className="block w-full drop-shadow-[0_24px_24px_rgba(0,0,0,0.22)]"
              />
            </Tilt>
            <div className="mx-auto mt-2 max-w-md border-t-4 border-brand pt-4 text-center">
              <p className="font-display text-lg font-extrabold">{FOUNDER.name}</p>
              <p className="text-sm text-ink-soft">{t(FOUNDER.role)}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <SectionHeading eyebrow={t('Meet the founder')} title={t('{name}: an engineer and MBA who guides like a friend.', { name: FOUNDER.name })} />
            <p className="-mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{t(FOUNDER.summary)}.</p>
            <ul className="mt-8 space-y-3">
              {FOUNDER.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-ink">
                  <span className="mt-2 h-2 w-2 shrink-0 bg-brand" aria-hidden />
                  {t(h)}
                </li>
              ))}
            </ul>
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em]">{t('Awards & certifications')}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {FOUNDER.awards.map((a) => (
                <li
                  key={a.name}
                  className="flex items-center gap-3 border border-ink/20 bg-white py-2 pl-2 pr-4 text-sm font-semibold shadow-[0_3px_0_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#ffb81c]"
                >
                  <img src={a.logo} alt="" loading="lazy" className="h-9 w-9 shrink-0 object-contain" />
                  {a.name}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${btnOutline} mt-10`}
              onClick={() =>
                openWhatsApp({ phoneE164: SITE.whatsappE164, message: `Hi ${SITE.name}, I'd like to speak with ${FOUNDER.name} about counselling.` })
              }
            >
              {t('Talk to our team')}
            </button>
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <HowItWorks />

      <section className="py-20 md:py-28">
        <div className={container}>
          <SectionHeading
            eyebrow={t('For every family')}
            title={t('Good guidance should never depend on how much you can spend.')}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {inclusive.map((p, i) => (
              <Tilt key={p.title} as="article" className="border border-line border-t-4 border-t-brand bg-white p-8 hover:shadow-2xl">
                <span className="font-display text-sm font-extrabold text-ink/40 [transform:translateZ(20px)]">0{i + 1}</span>
                <h3 className="mt-6 font-display text-2xl font-extrabold leading-tight [transform:translateZ(30px)]">{t(p.title)}</h3>
                <p className="mt-3 leading-relaxed text-ink-soft [transform:translateZ(14px)]">{t(p.text)}</p>
              </Tilt>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
