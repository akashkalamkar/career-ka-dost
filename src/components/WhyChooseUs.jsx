import { container } from '../config/ui'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'
import { useT } from '../i18n'

const reasons = [
  { title: 'We treat students like friends', desc: 'We listen, understand and guide like a true friend who cares.' },
  { title: 'Personalised guidance', desc: 'Tailored advice based on your aptitude, interests, personality and goals.' },
  { title: 'Scientific and AI-based assessments', desc: 'DMIT and NEMA AI assessments for accurate career insights.' },
  { title: 'Beyond JEE and NEET', desc: 'Explore many career options beyond the conventional choices.' },
  { title: 'For students and parents', desc: 'We guide both students and parents at every step.' },
  { title: 'Rated 4.9 on Google', desc: 'Trusted by the families we have guided across India.' },
]

export function WhyChooseUs() {
  const t = useT()
  return (
    <section id="why-us" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow={t('Why Career Ka Dost')}
          title={t('Guidance you can trust, because this decision shapes decades.')}
          subtitle={t('We combine proven assessments with a personal approach, so no career decision is made in confusion or under pressure.')}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Tilt key={r.title} as="article" className="bg-paper-2 p-8 transition-colors hover:bg-brand hover:shadow-2xl md:p-10">
              <span className="block font-display text-5xl font-extrabold text-brand-deep/80 [transform:translateZ(44px)]">0{i + 1}</span>
              <h3 className="mt-6 font-display text-2xl font-extrabold leading-tight [transform:translateZ(28px)]">{t(r.title)}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft [transform:translateZ(14px)]">{t(r.desc)}</p>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  )
}
