/**
 * Blog posts. To add one, copy an entry and give it a unique `slug`.
 * `body` blocks: { type: 'h', text } heading, { type: 'p', text } paragraph, { type: 'ul', items: [...] } list.
 * Please read each post and edit it to your own voice before publishing.
 */
export const POSTS = [
  {
    slug: 'josaa-counselling-explained-for-parents',
    title: 'JoSAA counselling explained for parents',
    category: 'Engineering',
    date: '2026-10-10',
    readTime: '4 min read',
    excerpt: 'What JoSAA is, how the rounds work, and the mistakes families make when filling choices.',
    body: [
      { type: 'p', text: 'JoSAA (Joint Seat Allocation Authority) runs the counselling for IITs, NITs, IIITs and other centrally funded technical institutions. Seats are offered according to JEE ranks, in several rounds.' },
      { type: 'h', text: 'How the process works' },
      { type: 'ul', items: ['Register and fill in your choices (college and branch combinations) in order of preference.', 'Lock your choices before the deadline.', 'A seat is allotted in each round based on your rank and your choice order.', 'You accept the seat, or choose to upgrade in the next round, and complete document verification.'] },
      { type: 'h', text: 'Mistakes to avoid' },
      { type: 'ul', items: ['Filling only a few choices. A longer, well-ordered list protects you.', 'Chasing a famous college name and ignoring the branch. Both matter.', 'Ignoring last year’s opening and closing ranks. They show what is realistic.', 'Missing a deadline. Keep documents ready and check the official JoSAA schedule daily.'] },
      { type: 'p', text: 'Always rely on the official JoSAA notifications for dates and rules. A counsellor can help you read cutoffs, compare options and build a safe order of choices, but the process itself is run by the authority.' },
    ],
  },
  {
    slug: 'neet-counselling-all-india-quota-vs-state-quota',
    title: 'NEET counselling: All India Quota vs state quota',
    category: 'Medical',
    date: '2026-10-10',
    readTime: '4 min read',
    excerpt: 'Two counselling streams run side by side. Here is how they differ and why most students should prepare for both.',
    body: [
      { type: 'p', text: 'After NEET UG, medical seats are allotted through more than one counselling process. Understanding the difference early saves a lot of confusion.' },
      { type: 'h', text: 'All India Quota (MCC)' },
      { type: 'p', text: 'The Medical Counselling Committee (MCC) conducts counselling for the 15% All India Quota seats in government medical colleges, and for seats in central and deemed universities. Any eligible candidate in India can apply.' },
      { type: 'h', text: 'State quota' },
      { type: 'p', text: 'The remaining government seats, and seats in private colleges, are filled through counselling run by each state. State rules differ, and domicile or category often matters. In Maharashtra, this is handled by the state CET Cell.' },
      { type: 'h', text: 'What families should do' },
      { type: 'ul', items: ['Register for both MCC and your state counselling where eligible.', 'Keep category, domicile and income documents ready.', 'Compare fees across government, aided and private colleges before filling choices.', 'Prepare backup options, including other medical streams such as AYUSH courses, if relevant to your rank.'] },
      { type: 'p', text: 'Dates and rules change every year, so check the official notifications for the current process.' },
    ],
  },
  {
    slug: 'how-to-choose-a-stream-after-class-10',
    title: 'How to choose a stream after Class 10',
    category: 'Career guidance',
    date: '2026-10-10',
    readTime: '3 min read',
    excerpt: 'A simple way for students and parents to decide between Science, Commerce and Arts without pressure.',
    body: [
      { type: 'p', text: 'Choosing a stream feels like a huge decision, and it is an important one. But it does not have to be a stressful guess. Work through these questions together.' },
      { type: 'ul', items: ['What subjects does the student enjoy and do well in, without being pushed?', 'What kind of work sounds interesting: building, healing, analysing, creating, teaching, leading?', 'Which careers need which stream, and which entrance exams are involved?', 'How flexible is each option if the student changes their mind later?'] },
      { type: 'h', text: 'Avoid these traps' },
      { type: 'ul', items: ['Following friends or cousins into a stream.', 'Choosing only for what looks prestigious.', 'Deciding based on one result or one subject.'] },
      { type: 'p', text: 'A structured session, or an assessment followed by a proper conversation, gives the student something concrete to think about. The goal is to choose with clarity and confidence, not under pressure.' },
    ],
  },
  {
    slug: 'what-is-a-psychometric-test',
    title: 'What is a psychometric test, and can it help you choose a career?',
    category: 'Career guidance',
    date: '2026-10-10',
    readTime: '3 min read',
    excerpt: 'What these assessments measure, what they cannot do, and how to get real value from one.',
    body: [
      { type: 'p', text: 'A psychometric test is a structured assessment that looks at a person’s interests, aptitudes and personality. Career counsellors use the results as a starting point for a conversation.' },
      { type: 'h', text: 'What it can do' },
      { type: 'ul', items: ['Give students words for strengths and preferences they already feel.', 'Suggest career areas they may not have considered.', 'Make the discussion between student and parents calmer and more focused.'] },
      { type: 'h', text: 'What it cannot do' },
      { type: 'p', text: 'No test can decide a career for you. Marks, rank, budget, location and genuine interest all matter. The best use of a test is alongside an honest conversation with a counsellor, not instead of one.' },
      { type: 'p', text: 'You can take the Career Test on our website and then talk through the results with our team.' },
    ],
  },
  {
    slug: 'questions-to-ask-before-choosing-a-college',
    title: 'Five questions to ask before choosing a college',
    category: 'Admissions',
    date: '2026-10-10',
    readTime: '3 min read',
    excerpt: 'A short checklist for parents and students before locking a college in any counselling round.',
    body: [
      { type: 'p', text: 'When counselling deadlines are close, it is easy to choose in a hurry. These five questions keep the decision grounded.' },
      { type: 'ul', items: ['Is the college and the course recognised by the relevant regulator or council?', 'What is the full cost over the whole course, including hostel and other fees?', 'What do students from this branch actually do after graduating?', 'Is the location practical for your family, now and for the next four or five years?', 'Does the course genuinely fit the student’s interests and strengths?'] },
      { type: 'p', text: 'Write the answers down for each option on your list. Comparing on paper often makes the right choice clear, and it helps parents and students agree calmly.' },
    ],
  },
]
