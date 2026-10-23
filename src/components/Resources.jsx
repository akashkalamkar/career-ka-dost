import { useEffect, useRef, useState } from 'react'
import { RESOURCE_CLASSES } from '../config/resources'
import { SITE } from '../config/site'
import { btnPrimary, container } from '../config/ui'
import { SELECT_CLASS_EVENT } from '../utils/jump'
import { openWhatsApp } from '../utils/whatsapp'
import { BooksArt } from './Art3D'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'
import { ArrowIcon, BookIcon, DownloadIcon, WhatsAppIcon } from './icons'

const url = (path) => `${import.meta.env.BASE_URL}${path}`

const countOf = (subject) => (subject.options ? subject.options.reduce((n, o) => n + o.files.length, 0) : subject.files.length)
const resourceLabel = (n) => `${n} Resource${n > 1 ? 's' : ''}`

/** One downloadable file: a yellow button that saves the PDF on the visitor's device. */
function FileRow({ item }) {
  return (
    <li className="border border-line bg-paper-2 p-4">
      <p className="font-display text-xl font-extrabold leading-tight">
        {item.title}
        {item.badge ? <span className="ml-2 font-extrabold text-[#d92020]">{item.badge}</span> : null}
      </p>
      {item.points?.length ? (
        <ul className="mt-3 space-y-2">
          {item.points.map((point) => (
            <li key={point} className="flex gap-3 text-sm font-bold leading-snug text-ink">
              <span className="mt-1.5 h-2 w-2 shrink-0 bg-brand" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      ) : null}
      <a href={url(item.path)} download className={`${btnPrimary} mt-4 w-full !py-2.5`} aria-label={`Download ${item.title} (PDF)`}>
        <DownloadIcon className="h-5 w-5" />
        Download PDF
      </a>
    </li>
  )
}

function ComingSoon() {
  return <p className="border border-dashed border-ink/25 px-4 py-3 text-sm font-semibold text-mute">Coming soon</p>
}

function FileList({ files }) {
  return files.length ? (
    <ul className="space-y-3">
      {files.map((f) => (
        <FileRow key={f.path} item={f} />
      ))}
    </ul>
  ) : (
    <ComingSoon />
  )
}

/** The card on the page: subject name and how many resources it holds. Opening it shows the downloads. */
function SubjectCard({ subject, onOpen }) {
  const count = countOf(subject)
  return (
    <Tilt as="article" id={`res-${subject.id}`} className="flex flex-col border border-line border-t-4 border-t-brand bg-white p-6 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-extrabold leading-tight [transform:translateZ(26px)]">{subject.name}</h3>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand text-ink [transform:translateZ(34px)]">
          <BookIcon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-brass">{count ? resourceLabel(count) : 'Coming soon'}</p>

      <div className="mt-6">
        {count ? (
          <button type="button" onClick={() => onOpen(subject)} className={`${btnPrimary} w-full !py-2.5`}>
            Open resources
            <ArrowIcon className="h-4 w-4" />
          </button>
        ) : (
          <ComingSoon />
        )}
      </div>
    </Tilt>
  )
}

/** Pop-up with the downloads for one subject. Esc, the Close button or a click outside closes it. */
function ResourceDialog({ classLabel, subject, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`${classLabel} ${subject.name} resources`}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#5c3b00]/40 backdrop-blur-sm" />
      <div className="relative max-h-[88svh] w-full max-w-xl overflow-y-auto border-t-4 border-brand bg-white shadow-2xl sm:max-h-[85svh]">
        <div className="flex items-start justify-between gap-4 bg-paper-2 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">{classLabel}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight md:text-3xl">{subject.name}</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">{resourceLabel(countOf(subject))}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="shrink-0 border-2 border-brand-deep bg-white px-4 py-2 text-sm font-bold transition hover:bg-brand">
            Close
          </button>
        </div>

        <div className="space-y-6 p-6">
          {subject.options ? (
            subject.options.map((o) => (
              <div key={o.id}>
                <p className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em]">
                  <span className="h-2 w-2 bg-brand" aria-hidden />
                  {o.name}
                </p>
                <FileList files={o.files} />
              </div>
            ))
          ) : (
            <FileList files={subject.files} />
          )}
        </div>
      </div>
    </div>
  )
}

export function Resources() {
  const [classId, setClassId] = useState('class-10')
  const [opened, setOpened] = useState(null)
  const current = RESOURCE_CLASSES.find((c) => c.id === classId)

  useEffect(() => {
    const pick = (e) => setClassId(e.detail)
    window.addEventListener(SELECT_CLASS_EVENT, pick)
    return () => window.removeEventListener(SELECT_CLASS_EVENT, pick)
  }, [])

  function ask() {
    openWhatsApp({
      phoneE164: SITE.whatsappE164,
      message: `Hi ${SITE.name}, I'd like a practice paper for ${current.label}. Subject: `,
    })
  }

  return (
    <section id="resources" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow="Free resources"
          title="Practice papers for every class."
          subtitle="Pick your class and subject, open it, then download the PDF to your phone or computer. Print it or solve it on screen."
          art={<BooksArt />}
        />

        <div className="flex flex-wrap gap-3" role="tablist" aria-label="Choose your class">
          {RESOURCE_CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={classId === c.id}
              onClick={() => setClassId(c.id)}
              className={`border-2 px-6 py-3 font-display text-lg font-extrabold transition hover:-translate-y-0.5 hover:shadow-lg ${
                classId === c.id ? 'border-brand-deep bg-brand' : 'border-ink/15 bg-white hover:border-brand-deep'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mb-8 mt-10 flex flex-col gap-1 border-b-2 border-brand pb-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">{current.label}</h2>
          <p className="text-ink-soft">{current.blurb}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="tabpanel">
          {current.subjects.map((s) => (
            <SubjectCard key={`${current.id}-${s.id}`} subject={s} onOpen={(subject) => setOpened({ classLabel: current.label, subject })} />
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-5 border border-line bg-paper-2 p-6 md:flex-row md:items-center md:p-8">
          <div>
            <p className="font-display text-xl font-extrabold">Need a paper that is not here yet?</p>
            <p className="mt-1 text-ink-soft">Tell us your class and subject on WhatsApp and we will share it as soon as it is ready.</p>
          </div>
          <button type="button" onClick={ask} className={`${btnPrimary} shrink-0`}>
            <WhatsAppIcon className="h-5 w-5" />
            Ask on WhatsApp
          </button>
        </div>
      </div>

      {opened ? <ResourceDialog classLabel={opened.classLabel} subject={opened.subject} onClose={() => setOpened(null)} /> : null}
    </section>
  )
}
