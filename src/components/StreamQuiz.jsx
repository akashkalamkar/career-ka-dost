import { useState } from 'react'
import { btnInk, btnPrimary, container } from '../config/ui'
import { trackEvent } from '../utils/analytics'
import { bookProps } from '../utils/leadForm'

/**
 * "Which stream suits me?" - a 10-question self-check for Class 9 and 10 students. Each answer adds a
 * point to one or more streams; the result shows the strongest match and the next one, with what each
 * leads to and links to read more or book a session. It is a quick self-check, not a psychometric test.
 */

const STREAMS = {
  pcm: {
    name: 'Science (PCM)',
    leads: 'Engineering, architecture, computer science, data science, pure sciences, defence and many more.',
  },
  pcb: {
    name: 'Science (PCB)',
    leads: 'Medicine (MBBS, BDS, BAMS, BHMS), nursing, physiotherapy, pharmacy, biotechnology and life sciences.',
  },
  com: {
    name: 'Commerce',
    leads: 'CA, CS, CMA, B.Com, BBA, economics, banking, finance, business and management.',
  },
  arts: {
    name: 'Arts / Humanities',
    leads: 'Law, psychology, journalism and media, design, civil services, languages and social sciences.',
  },
}

const QUESTIONS = [
  { q: 'Which subject do you enjoy the most?', a: [['Mathematics', ['pcm']], ['Biology', ['pcb']], ['Accounts, business or economics topics', ['com']], ['History, languages or civics', ['arts']]] },
  { q: 'Which school task do you like doing?', a: [['Solving tricky numerical problems', ['pcm']], ['Experiments and learning how living things work', ['pcb']], ['Planning a budget or running a stall at a school fair', ['com']], ['Writing, debating or making presentations', ['arts']]] },
  { q: 'What would you rather read about in your free time?', a: [['Gadgets, space or how machines work', ['pcm']], ['The human body, health or nature', ['pcb']], ['Business stories, money and markets', ['com']], ['People, society, stories or current affairs', ['arts']]] },
  { q: 'Which of these sounds like a good working day?', a: [['Building or designing something', ['pcm']], ['Helping patients feel better', ['pcb']], ['Making business decisions with numbers', ['com']], ['Arguing a case, writing or creating content', ['arts']]] },
  { q: 'How do you feel about long hours of Maths practice?', a: [['I enjoy it', ['pcm', 'com']], ['It is fine, but I prefer Biology', ['pcb']], ['I manage, for business maths', ['com']], ['I would rather avoid it', ['arts', 'pcb']]] },
  { q: 'What kind of problems do you like solving?', a: [['Logical puzzles with one right answer', ['pcm']], ['Understanding why something happens in the body or nature', ['pcb']], ['How to make something profitable', ['com']], ['Questions about people and society with many points of view', ['arts']]] },
  { q: 'Which of these would you most like to learn?', a: [['Coding or robotics', ['pcm']], ['First aid or how medicines work', ['pcb']], ['Investing or how a company works', ['com']], ['A new language or public speaking', ['arts']]] },
  { q: 'In a group project, you usually...', a: [['Handle the calculations and technical parts', ['pcm']], ['Do the research and observations', ['pcb']], ['Organise the plan, budget and roles', ['com']], ['Write the report and present it', ['arts']]] },
  { q: 'Which of these exams would you be happiest preparing for?', a: [['JEE or MHT CET (engineering)', ['pcm']], ['NEET (medical)', ['pcb']], ['CA Foundation or a BBA entrance', ['com']], ['CLAT (law) or a design or mass media entrance', ['arts']]] },
  { q: 'What matters most to you in a future career?', a: [['Working with technology and innovation', ['pcm']], ['Caring for people’s health', ['pcb']], ['Running or growing a business', ['com']], ['Expressing ideas and influencing society', ['arts']]] },
]

export function StreamQuiz() {
  const [answers, setAnswers] = useState([])
  const done = answers.length === QUESTIONS.length
  const step = answers.length

  function choose(i) {
    const next = [...answers, i]
    setAnswers(next)
    if (next.length === QUESTIONS.length) trackEvent('quiz_complete', { quiz: 'stream' })
  }

  const scores = { pcm: 0, pcb: 0, com: 0, arts: 0 }
  answers.forEach((choice, qi) => QUESTIONS[qi].a[choice][1].forEach((s) => (scores[s] += 1)))
  const ranked = Object.keys(scores).sort((x, y) => scores[y] - scores[x])
  const total = Object.values(scores).reduce((n, v) => n + v, 0) || 1

  return (
    <section className="py-16 md:py-24">
      <div className={`${container} max-w-3xl`}>
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em]">
          <span className="h-1 w-8 bg-brand" aria-hidden />
          Free stream quiz
        </p>
        <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">Which stream should I choose after 10th?</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Answer 10 quick questions to see whether Science (PCM or PCB), Commerce or Arts matches your interests best. It takes about two
          minutes. This is a quick self-check to start your thinking, not a psychometric test.
        </p>

        {!done ? (
          <div className="mt-10 border border-line border-t-8 border-t-brand bg-white p-6 md:p-8">
            <div className="flex items-center justify-between text-sm font-bold text-ink-soft">
              <span>
                Question {step + 1} of {QUESTIONS.length}
              </span>
              {step > 0 ? (
                <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} className="underline decoration-brand decoration-2 underline-offset-4">
                  Back
                </button>
              ) : null}
            </div>
            <div className="mt-3 h-2 bg-paper-2" aria-hidden>
              <div className="h-2 bg-brand transition-all" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
            </div>
            <h2 className="mt-6 font-display text-2xl font-extrabold">{QUESTIONS[step].q}</h2>
            <div className="mt-5 grid gap-3">
              {QUESTIONS[step].a.map(([label], i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => choose(i)}
                  className="border-2 border-line bg-paper px-5 py-4 text-left font-semibold transition hover:-translate-y-0.5 hover:border-brand-deep hover:bg-brand/20"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 border border-line border-t-8 border-t-brand bg-white p-6 md:p-8" role="status">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">Your result</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold">You lean towards {STREAMS[ranked[0]].name}</h2>
            <p className="mt-3 text-lg text-ink-soft">{STREAMS[ranked[0]].name} can lead to {STREAMS[ranked[0]].leads.charAt(0).toLowerCase() + STREAMS[ranked[0]].leads.slice(1)}</p>
            {scores[ranked[1]] > 0 ? (
              <p className="mt-3 text-ink-soft">
                Your next closest match is <strong className="text-ink">{STREAMS[ranked[1]].name}</strong>: {STREAMS[ranked[1]].leads}
              </p>
            ) : null}

            <ul className="mt-6 space-y-3">
              {ranked.map((s) => (
                <li key={s}>
                  <div className="flex justify-between text-sm font-bold">
                    <span>{STREAMS[s].name}</span>
                    <span>{Math.round((scores[s] / total) * 100)}%</span>
                  </div>
                  <div className="mt-1 h-2 bg-paper-2">
                    <div className="h-2 bg-brand" style={{ width: `${(scores[s] / total) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm text-mute">
              A quiz like this only shows where your interests point today. Marks, aptitude, family situation and goals matter too - a
              counsellor can help you weigh them all before you decide.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a {...bookProps} className={btnPrimary}>
                Book a counselling session
              </a>
              <button type="button" onClick={() => setAnswers([])} className={btnInk}>
                Take the quiz again
              </button>
            </div>
            <p className="mt-6 text-sm font-semibold">
              Read next:{' '}
              <a href="/blog/how-to-choose-a-stream-after-class-10" className="underline decoration-brand decoration-2 underline-offset-4">
                How to choose a stream after 10th
              </a>{' '}
              ·{' '}
              <a href="/career-counselling-after-10th-nagpur" className="underline decoration-brand decoration-2 underline-offset-4">
                Career counselling after 10th
              </a>{' '}
              ·{' '}
              <a href="/career-test" className="underline decoration-brand decoration-2 underline-offset-4">
                Full career test
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
