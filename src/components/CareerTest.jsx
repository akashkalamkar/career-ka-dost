import { useEffect, useRef, useState } from 'react'
import { CAREER_TESTS, SITE } from '../config/site'
import { btnOutline, btnPrimary, container } from '../config/ui'
import { openWhatsApp } from '../utils/whatsapp'
import { ClipboardArt } from './Art3D'
import { ArrowIcon, ClipboardIcon, ChipIcon, UsersIcon } from './icons'
import { SectionHeading } from './SectionHeading'
import { Tilt } from './Tilt'

const steps = [
  { icon: ClipboardIcon, t: 'Take the test', d: 'Choose a test with the button below, or scan the QR code in our brochure.' },
  { icon: ChipIcon, t: 'Get your insights', d: 'DMIT and NEMA AI assessments highlight your strengths, interests and learning style.' },
  { icon: UsersIcon, t: 'Talk it through', d: 'Discuss the results with a counsellor, with your parents if you like, and turn them into a plan.' },
]

const forWho = ['Class 9 and 10 students choosing a stream', 'Class 11 and 12 students unsure about a course', 'Parents who want a calm, structured starting point', 'Anyone feeling stuck between several careers']

/** Pop-up that lets the student choose which test to take. Each one opens its Google Form in a new tab. */
function TestChooser({ onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Choose your test">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#5c3b00]/40 backdrop-blur-sm" />
      <div className="relative max-h-[90svh] w-full max-w-xl overflow-y-auto border-t-4 border-brand bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-paper-2 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">Career test</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight md:text-3xl">Which test would you like to take?</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="shrink-0 border-2 border-brand-deep bg-white px-4 py-2 text-sm font-bold transition hover:bg-brand">
            Close
          </button>
        </div>

        <ul className="space-y-4 p-6">
          {CAREER_TESTS.map((test) => (
            <li key={test.id}>
              <a
                href={test.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="group flex items-center gap-4 border-2 border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-deep hover:bg-brand hover:shadow-lg"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-brand text-ink shadow-[0_4px_0_0_#b97f00] transition group-hover:bg-white">
                  <ClipboardIcon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-extrabold leading-tight">{test.name}</span>
                  <span className="mt-1 block text-sm font-medium text-ink-soft group-hover:text-ink">{test.text}</span>
                </span>
                <ArrowIcon className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
              </a>
            </li>
          ))}
        </ul>
        <p className="px-6 pb-6 text-sm text-mute">The test opens in a new tab. It takes a few minutes.</p>
      </div>
    </div>
  )
}

export function CareerTest() {
  const [choosing, setChoosing] = useState(false)

  return (
    <section id="career-test" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Career test"
              title="Your career starts with one test."
              subtitle="Not sure where to begin? Take our psychometric assessment and see which paths fit you best, then talk it through with a counsellor who knows what to do next."
            />
            <div className="-mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setChoosing(true)} className={btnPrimary}>
                Start the test
              </button>
              <button
                type="button"
                onClick={() => openWhatsApp({ phoneE164: SITE.whatsappE164, message: `Hi ${SITE.name}, I took the psychometric test and would like to discuss my results.` })}
                className={btnOutline}
              >
                Discuss my results
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="hidden lg:block">
              <ClipboardArt className="max-w-[15rem]" />
            </div>
            <Tilt className="border border-line border-t-8 border-t-brand bg-paper-2 p-8 shadow-xl md:p-10 lg:mt-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] [transform:translateZ(14px)]">This test is for</p>
              <ul className="mt-5 space-y-3">
                {forWho.map((w) => (
                  <li key={w} className="flex gap-3 [transform:translateZ(20px)]">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand" aria-hidden />
                    <span className="font-medium">{w}</span>
                  </li>
                ))}
              </ul>
            </Tilt>
          </div>
        </div>

        <ol className="mt-20 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Tilt key={s.t} as="li" className="border border-line border-t-4 border-t-brand bg-white p-7 hover:shadow-2xl">
              <span className="flex h-14 w-14 items-center justify-center bg-brand shadow-[0_4px_0_0_#b97f00] [transform:translateZ(44px)]">
                <s.icon className="h-7 w-7" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-mute">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-2xl font-extrabold [transform:translateZ(26px)]">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft [transform:translateZ(12px)]">{s.d}</p>
            </Tilt>
          ))}
        </ol>

        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-soft">
          A psychometric test is a starting point for a conversation, not a final verdict. Marks, rank, budget and genuine interest all matter too.
        </p>
      </div>

      {choosing ? <TestChooser onClose={() => setChoosing(false)} /> : null}
    </section>
  )
}
