import { useState } from 'react'
import { SITE } from '../config/site'
import { btnInk, btnPrimary, container } from '../config/ui'
import { trackEvent } from '../utils/analytics'
import { signInEnabled, useAuth } from '../utils/auth'
import { bookProps } from '../utils/leadForm'
import { useProgress } from '../utils/progress'
import { RichText } from './BlogPost'
import { Celebration } from './Celebration'
import { ShareWhatsApp } from './ShareButtons'
import { AccountBar, GoogleButton } from './SignIn'

/**
 * One free checklist page (data: src/config/checklists.js). Two kinds:
 * - "documents": one tick per document (e.g. NEET or MHT CET counselling documents);
 * - "syllabus": every chapter with two ticks, Studied and Revised, grouped by subject and class.
 * Ticks are kept on the device, and in the student's own account once they sign in with Google
 * (see utils/progress.js). When everything is ticked, a "Hurray! Congratulations" pop-up appears.
 */

const STEPS = [
  ['s', 'Studied'],
  ['r', 'Revised'],
]

/** Every tick key in a list, e.g. ["domicile"] or ["vectors_s", "vectors_r", ...]. */
function tickKeys(list) {
  if (list.kind === 'documents') return list.documents.map((d) => d.id)
  return list.subjects.flatMap((s) => s.sections.flatMap((sec) => sec.items.flatMap((it) => STEPS.map(([k]) => `${it.id}_${k}`))))
}

const countIn = (keys, ticks) => keys.reduce((n, k) => n + (ticks[k] ? 1 : 0), 0)

function Bar({ done, total, className = '' }) {
  return (
    <div className={`h-2 bg-paper-2 ${className}`} aria-hidden>
      <div className="h-2 bg-brand transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
    </div>
  )
}

function SaveStatus({ status }) {
  const { user } = useAuth()
  if (!user) return null
  const text = {
    loading: 'Loading your saved ticks...',
    saving: 'Saving...',
    saved: 'All ticks saved to your account',
    error: 'Could not reach your account - ticks are kept on this device. Check your internet.',
  }[status]
  return text ? <p className={`text-sm font-semibold ${status === 'error' ? 'text-[#a40000]' : 'text-[#137a43]'}`}>{text}</p> : null
}

function SignInPanel({ status }) {
  const { user, known } = useAuth()
  if (!signInEnabled) return null
  return (
    <div className="mt-8 border-2 border-brand-deep bg-[#fff8e1] p-5 print:hidden">
      {user ? (
        <div className="flex flex-col gap-2">
          <AccountBar />
          <SaveStatus status={status} />
        </div>
      ) : (
        <>
          <p className="font-display text-lg font-extrabold">Save your progress on any phone or laptop</p>
          <p className="mt-1 text-ink-soft">Sign in with your Gmail and your ticks are saved to your account. Come back any time - they will still be there.</p>
          {known ? <GoogleButton label="Sign in with Google" from="checklist" className="mt-4" /> : <p className="mt-4 text-sm font-semibold text-mute">Checking if you are signed in...</p>}
        </>
      )}
    </div>
  )
}

function Box({ checked, onChange, label, disabled }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} aria-label={label} className="h-5 w-5 shrink-0 accent-[#a86400]" />
      <span className="sm:sr-only">{label.split(': ')[0]}</span>
    </label>
  )
}

function DocumentsList({ list, ticks, toggle, busy }) {
  return (
    <ol className="mt-6 divide-y divide-line">
      {list.documents.map((d, i) => (
        <li key={d.id}>
          <label className="flex cursor-pointer items-start gap-4 py-4">
            <input type="checkbox" checked={Boolean(ticks[d.id])} onChange={() => toggle(d.id)} disabled={busy} className="mt-1 h-5 w-5 shrink-0 accent-[#a86400]" />
            <span>
              <span className={`font-semibold ${ticks[d.id] ? 'text-mute line-through' : 'text-ink'}`}>
                {i + 1}. {d.name}
              </span>
              {d.note ? <span className="mt-0.5 block text-sm text-ink-soft">{d.note}</span> : null}
            </span>
          </label>
        </li>
      ))}
    </ol>
  )
}

function SyllabusList({ list, ticks, toggle, busy }) {
  return (
    <div className="mt-6 space-y-10">
      {list.subjects.map((subject) => {
        const keys = subject.sections.flatMap((sec) => sec.items.flatMap((it) => STEPS.map(([k]) => `${it.id}_${k}`)))
        const done = countIn(keys, ticks)
        return (
          <section key={subject.id} aria-labelledby={`sub-${subject.id}`}>
            <div className="flex items-end justify-between gap-4 border-b-2 border-brand pb-2">
              <h2 id={`sub-${subject.id}`} className="font-display text-2xl font-extrabold">
                {subject.name}
              </h2>
              <p className="text-sm font-bold text-ink-soft">
                {done} of {keys.length} ticks
              </p>
            </div>
            <Bar done={done} total={keys.length} className="mt-2 print:hidden" />
            {subject.sections.map((sec) => (
              <div key={sec.name} className="mt-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-brass">{sec.name}</h3>
                <div className="mt-1 hidden grid-cols-[1fr_5rem_5rem] gap-2 border-b border-line pb-1 text-xs font-bold uppercase tracking-wider text-mute sm:grid">
                  <span>Chapter</span>
                  <span className="text-center">Studied</span>
                  <span className="text-center">Revised</span>
                </div>
                <ol className="divide-y divide-line">
                  {sec.items.map((it, i) => {
                    const both = ticks[`${it.id}_s`] && ticks[`${it.id}_r`]
                    return (
                      <li key={it.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_5rem_5rem] sm:items-center">
                        <span className={`font-semibold ${both ? 'text-mute line-through' : 'text-ink'}`}>
                          {i + 1}. {it.name}
                        </span>
                        <span className="flex gap-6 sm:contents">
                          {STEPS.map(([k, label]) => (
                            <span key={k} className="sm:flex sm:justify-center">
                              <Box checked={Boolean(ticks[`${it.id}_${k}`])} onChange={() => toggle(`${it.id}_${k}`)} disabled={busy} label={`${label}: ${it.name}`} />
                            </span>
                          ))}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

export function Checklist({ list }) {
  const migrate = list.kind === 'documents' ? (positions) => Object.fromEntries(positions.map((i) => list.documents[i]).filter(Boolean).map((d) => [d.id, true])) : undefined
  const { ticks, status, toggle, clear } = useProgress(list.listId, migrate)
  const [celebrate, setCelebrate] = useState(false)
  const keys = tickKeys(list)
  const done = countIn(keys, ticks)
  const total = keys.length
  const busy = status === 'loading'
  const unit = list.kind === 'documents' ? 'documents ready' : 'ticks done'

  function onToggle(key) {
    const next = toggle(key)
    if (countIn(keys, next) === total && !ticks[key]) {
      trackEvent('checklist_complete', { list: list.listId })
      setCelebrate(true)
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className={`${container} ${list.kind === 'documents' ? 'max-w-3xl' : 'max-w-4xl'}`}>
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] print:hidden">
          <span className="h-1 w-8 bg-brand" aria-hidden />
          {list.eyebrow}
        </p>
        <p className="hidden border-b-4 border-brand pb-3 font-display text-lg font-extrabold print:block">
          {SITE.fullName} · {SITE.phonePretty} · {SITE.websiteDisplay}
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">{list.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          <RichText text={list.intro} />
        </p>

        <SignInPanel status={status} />

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <button
            type="button"
            onClick={() => {
              trackEvent('checklist_print', { list: list.listId })
              window.print()
            }}
            className={btnInk}
          >
            Print / save as PDF
          </button>
          <ShareWhatsApp what="checklist" text={list.shareText} url={`https://www.careerkadost.com/${list.slug}`} label="Share this checklist" />
        </div>

        <div className="mt-10 border border-line border-t-8 border-t-brand bg-white p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 print:hidden">
            <p className="font-display text-lg font-extrabold">
              {done} of {total} {unit}
            </p>
            {done ? (
              <button
                type="button"
                onClick={() => window.confirm('Clear all ticks on this checklist?') && clear()}
                className="text-sm font-bold underline decoration-brand decoration-2 underline-offset-4"
              >
                Clear ticks
              </button>
            ) : null}
          </div>
          <Bar done={done} total={total} className="mt-3 print:hidden" />
          {list.kind === 'documents' ? <DocumentsList list={list} ticks={ticks} toggle={onToggle} busy={busy} /> : <SyllabusList list={list} ticks={ticks} toggle={onToggle} busy={busy} />}
        </div>

        <div className="mt-6 border-2 border-[#c40000] bg-[#fff1f1] p-4 md:p-5" role="note">
          <p className="font-display text-lg font-extrabold text-[#c40000]">Always check the latest official notice</p>
          <p className="mt-1 font-semibold text-[#8a0000]">
            Source: {list.source}. {list.sourceNote} Check {list.sourceUrl.replace('https://', '')} for the current year.
          </p>
        </div>

        <div className="mt-10 border-t-8 border-brand bg-paper-2 p-7 print:hidden">
          <p className="font-display text-2xl font-extrabold leading-tight">{list.help.title}</p>
          <p className="mt-3 text-ink-soft">
            <RichText text={list.help.text} />
          </p>
          <a {...bookProps} className={`${btnPrimary} mt-6`}>
            Book counselling
          </a>
        </div>
      </div>

      {celebrate ? (
        <Celebration title={list.done.title} message={list.done.message} onClose={() => setCelebrate(false)}>
          <a {...bookProps} onClick={(e) => {
              setCelebrate(false)
              bookProps.onClick(e)
            }} className={`${btnPrimary} w-full`}>
            {list.done.cta}
          </a>
          <ShareWhatsApp what="checklist-complete" text={list.done.share} url={`https://www.careerkadost.com/${list.slug}`} label="Tell your friends on WhatsApp" className="justify-center" />
        </Celebration>
      ) : null}
    </section>
  )
}
