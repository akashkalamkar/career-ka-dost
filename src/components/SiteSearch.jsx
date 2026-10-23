import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { SITE } from '../config/site'
import { container } from '../config/ui'
import { jumpTo } from '../utils/jump'
import { POPULAR, searchSite } from '../utils/searchIndex'
import { openWhatsApp } from '../utils/whatsapp'
import { ArrowIcon, SearchIcon, WhatsAppIcon } from './icons'

/** Wraps the typed words in a yellow highlight. */
function Marked({ text, query }) {
  const words = query.toLowerCase().split(/[\s,]+/).filter(Boolean)
  if (!words.length) return text
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig')
  return text.split(pattern).map((part, i) =>
    words.includes(part.toLowerCase()) ? (
      <mark key={i} className="bg-brand/60 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

/** The search bar that drops down under the header, with suggestions from this website only. */
export function SearchPanel({ onClose }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listId = useId()

  const typed = query.trim().length > 0
  const results = useMemo(() => (typed ? searchSite(query) : POPULAR), [query, typed])

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function choose(entry) {
    onClose()
    jumpTo(entry)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (results.length ? (a + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      choose(results[active])
    }
  }

  return (
    <>
      <button type="button" aria-label="Close search" onClick={onClose} className="fixed inset-0 -z-10 cursor-default bg-[#5c3b00]/25" />
      <div className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-2xl">
        <div className={`${container} py-5 md:py-6`}>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-brass" />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              aria-label="Search Career Ka Dost"
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDown}
              placeholder="Search our website"
              className="h-14 w-full rounded-lg border-2 border-brand-deep bg-white pl-14 pr-24 text-base font-semibold outline-none transition focus:ring-4 focus:ring-brand/40 md:text-lg"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-paper-2 hover:text-ink"
            >
              Close
            </button>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-brass">{typed ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Popular on our website'}</p>

          {results.length ? (
            <ul id={listId} role="listbox" className="mt-2 max-h-[55vh] divide-y divide-line overflow-y-auto border-y border-line">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.href}-${r.anchor ?? ''}-${r.title}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onClick={() => choose(r)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-4 px-3 py-3 text-left transition ${i === active ? 'bg-paper-2' : ''}`}
                  >
                    <span className="w-20 shrink-0 bg-brand px-2 py-1 text-center text-[0.65rem] font-extrabold uppercase tracking-wider">{r.type}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-base font-bold md:text-lg">
                        <Marked text={r.title} query={query} />
                      </span>
                      {r.detail ? <span className="block truncate text-sm text-mute">{r.detail}</span> : null}
                    </span>
                    <ArrowIcon className={`h-5 w-5 shrink-0 text-brass transition ${i === active ? 'translate-x-1' : ''}`} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 border border-line bg-paper-2 p-5" role="status">
              <p className="font-display text-xl font-extrabold">Nothing found for &ldquo;{query.trim()}&rdquo;.</p>
              <p className="mt-1 text-ink-soft">Try another word, or ask us directly and we will reply on WhatsApp.</p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 bg-brand px-5 py-2.5 text-sm font-bold shadow-[0_4px_0_0_#b97f00]"
                onClick={() => {
                  onClose()
                  openWhatsApp({ phoneE164: SITE.whatsappE164, message: `Hi ${SITE.name}, I was looking for: ${query.trim()}` })
                }}
              >
                <WhatsAppIcon className="h-4 w-4" />
                Ask on WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
