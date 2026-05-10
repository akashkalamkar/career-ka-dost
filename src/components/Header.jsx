import { SITE } from '../config/site'

const nav = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'Book Session', href: '#lead-form' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <a
          href="#hero"
          className="flex min-w-0 shrink-0 items-center gap-2.5 outline-none ring-brand-500/0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:gap-3"
        >
          <img
            src={SITE.logoUrl}
            alt=""
            width={48}
            height={48}
            decoding="async"
            className="h-9 w-auto shrink-0 object-contain sm:h-10 md:h-11"
          />
          <div className="min-w-0 flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-tight text-brand-700 sm:text-2xl">
              {SITE.name}
            </span>
            <span className="hidden text-xs text-slate-500 sm:block">{SITE.tagline}</span>
          </div>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#lead-form"
          className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 active:scale-[0.98]"
        >
          Free Counselling
        </a>
      </div>
    </header>
  )
}
