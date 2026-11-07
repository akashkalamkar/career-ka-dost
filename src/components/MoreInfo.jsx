import { PAGE_INFO } from '../config/pageInfo'
import { container } from '../config/ui'
import { RichText } from './BlogPost'

/** Helpful text under a page (headings, paragraphs, lists) from src/config/pageInfo.js. */
export function MoreInfo({ page }) {
  const blocks = PAGE_INFO[page]
  if (!blocks) return null
  return (
    <section className="border-t border-line py-14 md:py-20">
      <div className={`${container} max-w-3xl space-y-5 text-lg leading-relaxed text-ink-soft`}>
        {blocks.map((b, i) =>
          b.type === 'h' ? (
            <h2 key={i} className="!mt-10 font-display text-2xl font-extrabold text-ink first:!mt-0 md:text-3xl">
              {b.text}
            </h2>
          ) : b.type === 'ul' ? (
            <ul key={i} className="space-y-3">
              {b.items.map((it) => (
                <li key={it} className="flex gap-3">
                  <span className="mt-3 h-2 w-2 shrink-0 bg-brand" aria-hidden />
                  <span>
                    <RichText text={it} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p key={i}>
              <RichText text={b.text} />
            </p>
          ),
        )}
      </div>
    </section>
  )
}
