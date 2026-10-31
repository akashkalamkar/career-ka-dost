import { POSTS } from '../config/blog'
import { SITE } from '../config/site'
import { btnPrimary, container } from '../config/ui'
import { openWhatsApp } from '../utils/whatsapp'
import { formatDate } from '../utils/date'
import { bookProps } from '../utils/leadForm'
import { ArrowIcon } from './icons'

/**
 * Text with links: "[Book counselling](/contact)" in a post's text becomes a link to that page, so posts
 * can point readers (and Google) to related pages on the site.
 */
function RichText({ text }) {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\))/g)
  return parts.map((part, i) => {
    const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    return m ? (
      <a key={i} href={m[2]} className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4 hover:text-brass">
        {m[1]}
      </a>
    ) : (
      part
    )
  })
}

/** Up to `count` other posts, the same category first, newest first within each group. */
function relatedTo(post, count) {
  const rest = POSTS.filter((p) => p.slug !== post.slug).sort((a, b) => b.date.localeCompare(a.date))
  return [...rest.filter((p) => p.category === post.category), ...rest.filter((p) => p.category !== post.category)].slice(0, count)
}

export function BlogPost({ slug }) {
  const post = POSTS.find((p) => p.slug === slug)
  const related = post ? relatedTo(post, 3) : []

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

          {related.length ? (
            <nav aria-label="Related articles" className="mt-14 border-t-4 border-brand pt-8">
              <p className="font-display text-2xl font-extrabold">Related reading</p>
              <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.map((o) => (
                  <li key={o.slug}>
                    <a href={`/blog/${o.slug}`} className="flex h-full flex-col border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-deep hover:shadow-lg">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-brass">{o.category}</span>
                      <span className="mt-2 font-display text-lg font-bold leading-snug">{o.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-base text-ink-soft">
                See our <RichText text="[services and fees](/pricing)" />, take a <RichText text="[career test](/career-test)" /> or{' '}
                <RichText text="[book a counselling session](/contact)" />.
              </p>
            </nav>
          ) : null}
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

          </div>
        </aside>
      </div>
    </article>
  )
}
