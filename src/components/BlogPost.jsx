import { POSTS } from '../config/blog'
import { SITE } from '../config/site'
import { btnPrimary, container } from '../config/ui'
import { openWhatsApp } from '../utils/whatsapp'
import { formatDate } from '../utils/date'
import { bookProps } from '../utils/leadForm'
import { ArrowIcon } from './icons'

export function BlogPost({ slug }) {
  const post = POSTS.find((p) => p.slug === slug)
  const others = POSTS.filter((p) => p.slug !== slug).slice(0, 2)

  if (!post) {
    return (
      <section className="py-24">
        <div className={container}>
          <h1 className="font-display text-4xl font-extrabold">Article not found</h1>
          <a href="/blog" className="mt-6 inline-block font-bold underline decoration-brand decoration-2 underline-offset-4">
            Back to the blog
          </a>
        </div>
      </section>
    )
  }

  return (
    <article className="py-16 md:py-24">
      <div className={`${container} grid gap-12 lg:grid-cols-12`}>
        <div className="lg:col-span-8">
          <a href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink">
            <ArrowIcon className="h-5 w-5 rotate-180" />
            All articles
          </a>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-brass">{post.category}</p>
          <h1 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-mute">
            {formatDate(post.date)} &middot; {post.readTime}
          </p>
          <div className="mt-6 h-1 w-16 bg-brand" aria-hidden />

          <div className="mt-10 space-y-5 text-lg leading-[1.85] text-ink-soft">
            {post.body.map((b, i) =>
              b.type === 'h' ? (
                <h2 key={i} className="!mt-10 font-display text-2xl font-extrabold text-ink md:text-3xl">
                  {b.text}
                </h2>
              ) : b.type === 'h3' ? (
                <h3 key={i} className="!mt-8 font-display text-xl font-extrabold text-ink md:text-2xl">
                  {b.text}
                </h3>
              ) : b.type === 'ul' ? (
                <ul key={i} className="space-y-3">
                  {b.items.map((it) => (
                    <li key={it} className="flex gap-3">
                      <span className="mt-3 h-2 w-2 shrink-0 bg-brand" aria-hidden />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i}>{b.text}</p>
              ),
            )}
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <div className="border-t-8 border-brand bg-paper-2 p-7">
              <p className="font-display text-2xl font-extrabold leading-tight">Want advice for your situation?</p>
              <p className="mt-3 text-ink-soft">Book counselling and we will guide you step by step.</p>
              <a {...bookProps} className={`${btnPrimary} mt-6 w-full`}>
                Book counselling
              </a>
              <button
                type="button"
                className="mt-4 w-full text-sm font-bold underline decoration-brand decoration-2 underline-offset-4"
                onClick={() => openWhatsApp({ phoneE164: SITE.whatsappE164, message: `Hi ${SITE.name}, I read "${post.title}" and have a question.` })}
              >
                Or ask us on WhatsApp
              </button>
            </div>

            {others.length ? (
              <div className="mt-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em]">More to read</p>
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <a href={`/blog/${o.slug}`} className="block py-4 font-display text-lg font-bold leading-snug hover:text-brass">
                        {o.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  )
}
