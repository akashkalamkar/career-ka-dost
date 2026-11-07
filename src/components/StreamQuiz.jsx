import { useState } from 'react'
import { btnInk, btnPrimary, container } from '../config/ui'
import { trackEvent } from '../utils/analytics'
import { bookProps } from '../utils/leadForm'
import { ShareWhatsApp } from './ShareButtons'

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

// Everyday situations, not school subjects or exam names: the answers show how a student naturally thinks,
// what holds their attention and what kind of work they would find meaningful. Each answer points to one
// or more streams (pcm, pcb, com, arts). The order of answers is mixed so no letter always means one stream.
const QUESTIONS = [
  { q: 'A free Sunday afternoon, no phone allowed. What do you end up doing?', a: [['Looking after plants or a pet, or reading about how the body or nature works', ['pcb']], ['Taking something apart to see how it works, or solving a puzzle', ['pcm']], ['Reading, writing, drawing or talking with someone about ideas', ['arts']], ['Planning how to earn or save some money, or organising a small sale', ['com']]] },
  { q: 'A close friend is upset. What do you usually do first?', a: [['Suggest a practical, step-by-step way to fix the problem', ['pcm']], ['Listen, understand how they feel and find the right words', ['arts']], ['Notice if they are unwell or tired and take care of them', ['pcb']], ['Help them weigh the options and make a plan', ['com']]] },
  { q: 'Which news story would you actually read to the end?', a: [['A start-up that grew into a big company', ['com']], ['A new medicine or treatment that saves lives', ['pcb']], ['A court judgement or a debate on a social issue', ['arts']], ['A new rocket, robot or invention', ['pcm']]] },
  { q: 'You have to explain something to a younger child. What would you enjoy explaining most?', a: [['Why we fall ill and how the body heals itself', ['pcb']], ['How a bicycle gear or an electric circuit works', ['pcm']], ['How money kept in a bank grows over time', ['com']], ['A story from history, or why we have rules', ['arts']]] },
  { q: 'Which kind of mistake bothers you the most?', a: [['Wasting money or time', ['com']], ['A careless mistake that could hurt someone', ['pcb']], ['A wrong calculation or a gap in logic', ['pcm']], ['Someone being misunderstood or treated unfairly', ['arts']]] },
  { q: 'At a school exhibition, which stall would you choose to run?', a: [['A poster, skit or report on a social issue', ['arts']], ['A working model you built yourself', ['pcm']], ['The canteen stall, handling the cash and stock', ['com']], ['A project on nutrition, diseases or plants', ['pcb']]] },
  { q: 'How do you best learn something completely new?', a: [['Try it, test it, break it and rebuild it', ['pcm']], ['Observe carefully and remember the details and diagrams', ['pcb']], ['Read different views, discuss them, then form your own opinion', ['arts']], ['Look at real examples of what works and the numbers behind them', ['com']]] },
  { q: 'A long, detailed chapter full of names and diagrams. How does that feel?', a: [['Fine, if it is to the point and useful in real life', ['com']], ['I would much rather solve problems than read pages of text', ['pcm']], ['I enjoy long reading and writing answers in my own words', ['arts']], ['I can learn lots of details if the topic is about living things', ['pcb']]] },
  { q: 'Planning a class trip, which job do you naturally take?', a: [['The first-aid kit, food and everyone\u2019s well-being', ['pcb']], ['The budget and collecting money', ['com']], ['The route, timings and bookings online', ['pcm']], ['Convincing everyone, keeping it fun and writing the messages', ['arts']]] },
  { q: 'Which question do you catch yourself asking most often?', a: [['"Why do people think or behave like that?"', ['arts']], ['"How does this actually work?"', ['pcm']], ['"Is this worth it? What does it cost?"', ['com']], ['"Why does the body or nature do that?"', ['pcb']]] },
  { q: 'Working on numbers - percentages, graphs, equations - feels...', a: [['Satisfying when I find the method, even if it takes long', ['pcm', 'com']], ['Fine when it is about everyday things like profit or discounts', ['com']], ['OK when it explains something real, like growth or medicine doses', ['pcb']], ['Like a chore; I prefer subjects built on words and ideas', ['arts']]] },
  { q: 'Fifteen years from now, what would make you proudest?', a: [['People are healthier or alive because of my work', ['pcb']], ['My words, art or work changed how people think, or got someone justice', ['arts']], ['Something I designed or built is used by thousands of people', ['pcm']], ['I built a business, or I manage money and teams for others', ['com']]] },
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
          Answer 12 questions about everyday situations - there are no right or wrong answers, so pick what is truly like you, not what
          sounds best. It takes about three minutes and shows whether Science (PCM or PCB), Commerce or Arts matches how you think.
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

            <div className="mt-6 border-2 border-[#c40000] bg-[#fff1f1] p-4 md:p-5" role="note">
              <p className="font-display text-lg font-extrabold text-[#c40000]">Important: this is only a self-assessment quiz</p>
              <p className="mt-1 font-semibold text-[#8a0000]">
                It shows where your interests point today, not a final answer. Marks, aptitude, family situation and goals matter too.
                Please contact us for expert guidance before you choose your stream.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a {...bookProps} className={btnPrimary}>
                Book a counselling session
              </a>
              <button type="button" onClick={() => setAnswers([])} className={btnInk}>
                Take the quiz again
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
              <p className="font-semibold">Ask your friends to try it:</p>
              <ShareWhatsApp
                what="quiz_result"
                label="Share my result on WhatsApp"
                text={`I took the free "Which stream after 10th?" quiz by Career Ka Dost - I lean towards ${STREAMS[ranked[0]].name}! Which stream suits you? Try it (3 minutes):`}
                url="https://www.careerkadost.com/stream-quiz"
              />
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
