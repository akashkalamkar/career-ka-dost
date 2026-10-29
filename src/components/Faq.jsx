import { useMemo, useState } from 'react'
import { FAQ_CATEGORIES, FAQS } from '../config/faq'
import { SITE } from '../config/site'
import { slug } from '../utils/searchIndex'
import { btnInk, container } from '../config/ui'
import { openWhatsApp } from '../utils/whatsapp'
import { QuestionArt } from './Art3D'
import { SectionHeading } from './SectionHeading'
import { ChevronIcon, SearchIcon, WhatsAppIcon } from './icons'
import { useT } from '../i18n'

export function Faq() {
  const t = useT()
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FAQS.filter((f) => (category === 'All' || f.category === category) && (!q || `${f.q} ${f.a} ${t(f.q)} ${t(f.a)}`.toLowerCase().includes(q)))
  }, [category, query, t])

  return (
    <section id="faq" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow={t('FAQ')}
          title={t('Answers for students and parents.')}
          subtitle={t('Search, or pick a topic. If you cannot find your question, message us and we will reply.')}
          art={<QuestionArt />}
        />

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <label htmlFor="faq-search" className="sr-only">
                {t('Search questions')}
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" />
                <input
                  id="faq-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('Search questions')}
                  className="h-14 w-full rounded-lg border border-ink/25 bg-white pl-12 pr-4 text-base outline-none transition hover:border-brand-deep focus:border-brand-deep focus:ring-4 focus:ring-brand/30"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2 lg:flex-col" role="group" aria-label={t('Topics')}>
                {FAQ_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                    className={`border px-4 py-2.5 text-left text-sm font-semibold transition hover:-translate-y-0.5 ${
                      category === c ? 'border-brand-deep bg-brand' : 'border-ink/20 bg-white hover:border-ink/50'
                    }`}
                  >
                    {t(c)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            {items.length ? (
              <ul className="divide-y divide-line border-y border-line">
                {items.map((f) => (
                  <li key={f.q}>
                    <details id={`faq-${slug(f.q)}`} className="group py-1">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 font-display text-lg font-bold leading-snug marker:content-none md:text-xl [&::-webkit-details-marker]:hidden">
                        <span>{t(f.q)}</span>
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-paper-2 transition group-open:bg-brand">
                          <ChevronIcon className="h-5 w-5 transition-transform group-open:rotate-180" />
                        </span>
                      </summary>
                      <p className="max-w-2xl pb-6 pr-10 leading-relaxed text-ink-soft">{t(f.a)}</p>
                    </details>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border border-line bg-paper-2 p-8" role="status">
                <p className="font-display text-2xl font-extrabold">{t('No matching question.')}</p>
                <p className="mt-2 text-ink-soft">{t('Ask us directly and we will reply on WhatsApp.')}</p>
                <button
                  type="button"
                  className={`${btnInk} mt-5`}
                  onClick={() => openWhatsApp({ phoneE164: SITE.whatsappE164, message: `Hi ${SITE.name}, I have a question: ${query}` })}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t('Ask on WhatsApp')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
