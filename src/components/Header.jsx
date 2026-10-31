import { useCallback, useState } from 'react'
import { Brand } from './Brand'
import { btnPrimary, container } from '../config/ui'
import { bookProps, openLeadForm } from '../utils/leadForm'
import { SearchPanel } from './SiteSearch'
import { LockIcon, SearchIcon } from './icons'

const nav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Career Test', href: '/career-test' },
  { label: 'Results', href: '/results' },
  { label: 'Free Resources', href: '/resources' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Admin', href: '/admin', icon: LockIcon }, // shown as a lock icon only
]

export function Header({ path = '/' }) {
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const closeSearch = useCallback(() => setSearching(false), [])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md print:hidden">
      <div className={`${container} flex items-center justify-between gap-4 py-4`}>
        <a href="/" aria-label="Career Ka Dost home" onClick={() => setOpen(false)}>
          <Brand />
        </a>

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.href === path ? 'page' : undefined}
              aria-label={item.icon ? item.label : undefined}
              title={item.icon ? item.label : undefined}
              className={`border-b-2 py-1 text-sm font-semibold transition hover:text-ink ${item.href === path ? 'border-brand text-ink' : 'border-transparent text-ink-soft'}`}
            >
              {item.icon ? <item.icon className="h-5 w-5" /> : item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setSearching((v) => !v)
            }}
            aria-label="Search the website"
            aria-expanded={searching}
            className="flex h-10 items-center gap-2 rounded-full border-2 border-brand-deep bg-white px-3 text-sm font-bold text-ink transition hover:bg-brand"
          >
            <SearchIcon className="h-5 w-5" />
            <span className="hidden 2xl:inline">Search</span>
          </button>
          <span className="hidden sm:block">
            <a {...bookProps} className={`${btnPrimary} whitespace-nowrap !px-5 !py-2.5`}>
              Book counselling
            </a>
          </span>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center xl:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => {
              setSearching(false)
              setOpen((v) => !v)
            }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /> : <path d="M4 8h16M4 16h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {searching ? <SearchPanel onClose={closeSearch} /> : null}

      {open ? (
        <nav className="border-t border-line bg-paper xl:hidden" aria-label="Mobile">
          <div className={`${container} flex flex-col py-3`}>
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-label={item.icon ? item.label : undefined}
                className="border-b border-line/70 py-4 font-display text-xl font-semibold"
              >
                {item.icon ? <item.icon className="h-6 w-6" /> : item.label}
              </a>
            ))}
            <button
              type="button"
              className={`${btnPrimary} my-4 w-full`}
              onClick={() => {
                setOpen(false)
                openLeadForm()
              }}
            >
              Book counselling
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
