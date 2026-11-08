import { SERVICES } from '../config/services'
import { btnPrimary, container } from '../config/ui'
import { bookProps } from '../utils/leadForm'

/** Shown for any address that is not a page on this website (the address bar keeps what the visitor typed). */
export function NotFound() {
  return (
    <section className="py-20 md:py-28">
      <div className={`${container} max-w-3xl`}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brass">Page not found</p>
        <h1 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">We could not find that page.</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          The address may have a typing mistake, or the page may have moved. Here are the places most visitors are looking for:
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            ['/', 'Home'],
            ['/pricing', 'Services and fees'],
            ['/blog', 'Career guidance blog'],
            ['/stream-quiz', 'Free stream quiz'],
            ['/career-test', 'Career test'],
            ['/contact', 'Book counselling'],
            ...SERVICES.slice(0, 4).map((s) => [`/${s.slug}`, s.menu]),
          ].map(([href, label]) => (
            <li key={href}>
              <a href={href} className="block border border-line bg-white px-5 py-3 font-bold transition hover:-translate-y-0.5 hover:border-brand-deep hover:bg-brand/20">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a {...bookProps} className={`${btnPrimary} mt-10`}>
          Book counselling
        </a>
      </div>
    </section>
  )
}
