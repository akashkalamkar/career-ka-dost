import { LEGAL_UPDATED } from '../config/legal'
import { SITE } from '../config/site'
import { container } from '../config/ui'
import { ShieldArt } from './Art3D'
import { SectionHeading } from './SectionHeading'

const LEGAL_LINKS = [
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Terms and Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
]

/** Shared layout for the Refund Policy, Terms and Privacy pages. */
export function LegalPage({ doc, current }) {
  return (
    <section className="py-20 md:py-28">
      <div className={container}>
        <SectionHeading eyebrow="Legal" title={doc.title} subtitle={doc.intro} art={<ShieldArt className="max-w-[12rem]" />} />
        <div className="grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Policies</p>
              <ul className="mt-4 border-t border-line">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.href} className="border-b border-line">
                    <a
                      href={l.href}
                      aria-current={l.href === current ? 'page' : undefined}
                      className={`block border-l-4 px-4 py-3.5 font-semibold transition hover:bg-paper-2 ${
                        l.href === current ? 'border-brand bg-paper-2' : 'border-transparent'
                      }`}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-mute">Last updated: {LEGAL_UPDATED}</p>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <ol className="space-y-10">
              {doc.sections.map((s, i) => (
                <li key={s.h} className="border-t-2 border-brand pt-6">
                  <h2 className="flex items-baseline gap-4 font-display text-2xl font-extrabold">
                    <span className="text-brass">{String(i + 1).padStart(2, '0')}</span>
                    {s.h}
                  </h2>
                  <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink-soft">
                    {s.p.map((t) => (
                      <p key={t}>{t}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-14 bg-paper-2 p-7">
              <p className="font-display text-xl font-extrabold">Questions about this page?</p>
              <p className="mt-2 text-ink-soft">
                Call{' '}
                <a className="font-semibold underline decoration-brand decoration-2 underline-offset-4" href={`tel:${SITE.phoneTel}`}>
                  {SITE.phoneDisplay}
                </a>{' '}
                or email{' '}
                <a className="font-semibold underline decoration-brand decoration-2 underline-offset-4" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
