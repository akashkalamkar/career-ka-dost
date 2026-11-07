import { useSyncExternalStore } from 'react'
import { NEET_DOCUMENTS as LIST } from '../config/checklists'
import { SITE } from '../config/site'
import { btnInk, btnPrimary, container } from '../config/ui'
import { trackEvent } from '../utils/analytics'
import { bookProps } from '../utils/leadForm'
import { ShareWhatsApp } from './ShareButtons'

/**
 * Free document checklist for NEET UG state quota counselling in Maharashtra. Students tick documents as they
 * collect them (remembered on their own phone or computer only), print it or save it as PDF, and share it.
 */

const STORE = `ckd-checklist-${LIST.slug}`

// Ticks live in this browser's storage. Read through useSyncExternalStore so the ready-made page (no ticks)
// and the visitor's saved ticks never clash.
const listeners = new Set()
function readStore() {
  try {
    return window.localStorage.getItem(STORE) || '[]'
  } catch {
    return '[]'
  }
}
function writeStore(list) {
  try {
    if (list.length) window.localStorage.setItem(STORE, JSON.stringify(list))
    else window.localStorage.removeItem(STORE)
  } catch {
    /* private window: ticks just are not remembered */
  }
  listeners.forEach((fn) => fn())
}
function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function DocumentChecklist() {
  const raw = useSyncExternalStore(subscribe, readStore, () => '[]')
  let ticked = []
  try {
    ticked = JSON.parse(raw)
  } catch {
    ticked = []
  }

  function toggle(i) {
    writeStore(ticked.includes(i) ? ticked.filter((x) => x !== i) : [...ticked, i])
  }

  const done = ticked.length
  const total = LIST.documents.length

  return (
    <section className="py-16 md:py-24">
      <div className={`${container} max-w-3xl`}>
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] print:hidden">
          <span className="h-1 w-8 bg-brand" aria-hidden />
          Free document checklist
        </p>
        <p className="hidden border-b-4 border-brand pb-3 font-display text-lg font-extrabold print:block">
          Career Ka Dost · {SITE.phoneDisplay} · {SITE.websiteDisplay}
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">{LIST.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          For {LIST.courses}. This is the list of required documents published by the State CET Cell, Maharashtra. Tick each document as you get it ready, then print this page or save it as a PDF.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <button
            type="button"
            onClick={() => {
              trackEvent('checklist_print', { list: LIST.slug })
              window.print()
            }}
            className={btnInk}
          >
            Print / save as PDF
          </button>
          <ShareWhatsApp
            what="checklist"
            text="NEET UG 2026 counselling documents checklist for Maharashtra state quota (free, from Career Ka Dost):"
            url={`https://www.careerkadost.com/${LIST.slug}`}
            label="Share this checklist"
          />
        </div>

        <div className="mt-10 border border-line border-t-8 border-t-brand bg-white p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 print:hidden">
            <p className="font-display text-lg font-extrabold">
              {done} of {total} ready
            </p>
            {done ? (
              <button type="button" onClick={() => writeStore([])} className="text-sm font-bold underline decoration-brand decoration-2 underline-offset-4">
                Clear ticks
              </button>
            ) : null}
          </div>
          <div className="mt-3 h-2 bg-paper-2 print:hidden" aria-hidden>
            <div className="h-2 bg-brand transition-all" style={{ width: `${(done / total) * 100}%` }} />
          </div>

          <ol className="mt-6 divide-y divide-line">
            {LIST.documents.map((d, i) => (
              <li key={d.name}>
                <label className="flex cursor-pointer items-start gap-4 py-4">
                  <input type="checkbox" checked={ticked.includes(i)} onChange={() => toggle(i)} className="mt-1 h-5 w-5 shrink-0 accent-[#a86400]" />
                  <span>
                    <span className={`font-semibold ${ticked.includes(i) ? 'text-mute line-through' : 'text-ink'}`}>
                      {i + 1}. {d.name}
                    </span>
                    {d.note ? <span className="mt-0.5 block text-sm text-ink-soft">{d.note}</span> : null}
                  </span>
                </label>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 border-2 border-[#c40000] bg-[#fff1f1] p-4 md:p-5" role="note">
          <p className="font-display text-lg font-extrabold text-[#c40000]">Always check the latest official notice</p>
          <p className="mt-1 font-semibold text-[#8a0000]">
            Source: {LIST.source}. Documents and formats (Annexures) can change during counselling - check the State CET Cell website ({LIST.sourceUrl.replace('https://', '')}) before every round.
          </p>
        </div>

        <div className="mt-10 border-t-8 border-brand bg-paper-2 p-7 print:hidden">
          <p className="font-display text-2xl font-extrabold leading-tight">Not sure which documents apply to you?</p>
          <p className="mt-3 text-ink-soft">
            Caste validity, non-creamy layer and domicile papers take time to get. We help you check them early and guide you through every counselling round - see our{' '}
            <a href="/neet-counselling-maharashtra" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">
              NEET counselling
            </a>{' '}
            and{' '}
            <a href="/ayush-counselling-bams-bhms-bums" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">
              AYUSH counselling
            </a>{' '}
            help.
          </p>
          <a {...bookProps} className={`${btnPrimary} mt-6`}>
            Book counselling
          </a>
        </div>
      </div>
    </section>
  )
}
