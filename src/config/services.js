/**
 * Service pages: one page per service, each built around the searches people make for it (see the
 * owner's keyword list). The fee shown on each page comes from pricing.js (`plan` = the plan's name
 * there), so it always matches the Pricing page. `blog` lists related blog post slugs.
 * To add a page: copy an entry, give it a new `slug` (this is its web address) - it then appears in the
 * footer, the sitemap and Google's list automatically.
 */
export const SERVICES = [
  {
    slug: 'mht-cet-counselling-nagpur',
    menu: 'MHT CET counselling',
    title: 'MHT CET Counselling in Nagpur – CAP round & college selection',
    description: 'MHT CET counselling in Nagpur and online across Maharashtra: CAP round guidance, college and branch shortlisting, option form and document help.',
    eyebrow: 'Engineering admission',
    h1: 'MHT CET counselling in Nagpur',
    intro: 'One-to-one help through the Maharashtra engineering CAP rounds: from your MHT CET or JEE Main score to a seat you are happy with. In person at Sitabuldi, Nagpur, or online for students anywhere in Maharashtra.',
    plan: 'Engineering Counselling',
    help: [
      'A realistic shortlist of colleges and branches for your score, category and home university, using previous years’ official cut-offs.',
      'Planning the CAP option form in the right order: dream, realistic and safe choices, so you are never left without a seat.',
      'Clear advice on freeze, betterment and auto-freeze rules for the current year, round by round.',
      'A checklist of documents (domicile, caste validity, non-creamy layer, EWS, TFWS) well before the deadlines.',
      'JoSAA guidance too, if you are also aiming for IITs, NITs or IIITs with your JEE Main score.',
    ],
    steps: [
      ['Share your details', 'Score, category, home university, budget and the branches you like.'],
      ['Get your shortlist', 'We prepare a college and branch list with honest chances for each.'],
      ['Fill the option form together', 'We check every choice before you lock it.'],
      ['Round-by-round support', 'Help with each allotment, acceptance and reporting until admission.'],
    ],
    faqs: [
      ['Do you help students outside Nagpur?', 'Yes. Sessions are available online for students anywhere in Maharashtra, as well as in person at our Nagpur office.'],
      ['Can you guarantee a particular college?', 'No honest counsellor can. Seats depend on merit, category and the choices of other students. We help you make the best possible choices with the facts available.'],
      ['When should I contact you?', 'Ideally before CAP registration opens, so certificates and the shortlist are ready in time. We can still help once the rounds have started.'],
      ['Do you also guide JoSAA counselling?', 'Yes, engineering counselling covers JoSAA and MHT CET together.'],
    ],
    blog: ['mht-cet-cap-round-process-maharashtra-engineering-admission', 'josaa-counselling-explained-for-parents', 'questions-to-ask-before-choosing-a-college'],
  },
  {
    slug: 'neet-counselling-maharashtra',
    menu: 'NEET counselling',
    title: 'NEET Counselling in Maharashtra – MBBS, BDS, BAMS, BHMS admission',
    description: 'NEET counselling for Maharashtra state quota and All India Quota: MBBS, BDS, BAMS, BHMS admission guidance, choice filling and documents. Nagpur and online.',
    eyebrow: 'Medical admission',
    h1: 'NEET counselling in Maharashtra',
    intro: 'Guidance through Maharashtra state quota counselling (State CET Cell) and MCC All India Quota counselling, for MBBS, BDS, BAMS, BHMS and allied courses. In person in Nagpur or online across Maharashtra.',
    plan: 'Medical Counselling',
    help: [
      'Understanding which counselling you are eligible for: Maharashtra 85% state quota, 15% All India Quota, deemed universities and AYUSH.',
      'A realistic list of government and private colleges for your rank and category, using previous years’ official closing ranks.',
      'Careful choice filling, with fees, bonds and locations checked for every college on the list.',
      'Clear decisions between rounds: when to accept, upgrade or move between MCC and state seats.',
      'A document checklist (domicile, caste validity, non-creamy layer, EWS) prepared early.',
    ],
    steps: [
      ['Share your NEET details', 'Rank, category, domicile, budget and preferred courses.'],
      ['Understand your options', 'MBBS, BDS, BAMS, BHMS and allied courses, with honest chances.'],
      ['Plan your choices', 'State and All India lists, in the right order, before every round.'],
      ['Support until admission', 'Help with every allotment, reporting and document step.'],
    ],
    faqs: [
      ['Who conducts Maharashtra NEET counselling?', 'The State CET Cell, Maharashtra, for state quota seats. MCC conducts All India Quota and deemed university counselling.'],
      ['Can I take part in both MCC and state counselling?', 'Yes, if you are eligible for both. We help you follow the rules for keeping or leaving a seat when you get allotments in both.'],
      ['My rank is not in the MBBS range. What are my options?', 'BDS, BAMS, BHMS and allied health courses are respected professional degrees. We help you compare them honestly with your interests and budget.'],
      ['Do you guarantee admission?', 'No. Allotment depends on merit, category and seat availability. We help you make the best choices with the facts available.'],
    ],
    blog: ['maharashtra-neet-counselling-state-quota-mbbs-bams-bds', 'neet-counselling-all-india-quota-vs-state-quota', 'career-options-after-12th-science-pcm-pcb'],
  },
  {
    slug: 'dmit-test-nagpur',
    menu: 'DMIT test',
    title: 'DMIT Test in Nagpur – report counselling for students',
    description: 'DMIT test and DMIT report counselling in Nagpur for students and parents, combined with an honest career discussion. Online sessions across Maharashtra.',
    eyebrow: 'Career assessment',
    h1: 'DMIT test and report counselling in Nagpur',
    intro: 'A DMIT assessment with a detailed report, explained by a counsellor in plain language. We use it as one starting point for a conversation about your child’s strengths, interests and options, never as the only answer.',
    plan: 'DMIT',
    help: [
      'The DMIT assessment and a written report for the student.',
      'A one-to-one session where the report is explained to the student and parents in simple words.',
      'Linking the report to real streams, courses and careers, together with marks, interests and goals.',
      'Suggestions on next steps, such as a psychometric aptitude test or a career interest inventory where useful.',
    ],
    steps: [
      ['Book a slot', 'At our Sitabuldi, Nagpur office.'],
      ['Assessment', 'The DMIT assessment is completed.'],
      ['Report counselling', 'A counsellor explains the report to the student and parents.'],
      ['Plan', 'Clear next steps for stream or course choice.'],
    ],
    faqs: [
      ['Who is the DMIT test for?', 'Usually school students and their parents who want a structured starting point for a conversation about strengths and career direction.'],
      ['Is DMIT enough on its own to choose a career?', 'No single test should decide a career. We combine the report with discussion, marks, interests and, where helpful, psychometric tests.'],
      ['Can parents attend?', 'Yes, we encourage parents to join the report counselling session.'],
      ['Can the report counselling be done online?', 'Yes. Report counselling sessions are available online for families across Maharashtra.'],
    ],
    blog: ['what-is-a-psychometric-test', 'how-to-choose-a-stream-after-class-10', 'career-counselling-in-nagpur-how-to-choose-a-career-counsellor'],
  },
  {
    slug: 'career-counselling-for-schools',
    menu: 'Career counselling for schools',
    title: 'Career Counselling for Schools in Nagpur & Maharashtra',
    description: 'Career awareness sessions, seminars and workshops for schools in Nagpur and across Maharashtra: streams, courses, entrance exams and admissions for students.',
    eyebrow: 'For schools',
    h1: 'Career counselling for schools',
    intro: 'Career awareness sessions, seminars and workshops for Class 9 to 12 students, conducted at your school in Nagpur or anywhere in Maharashtra. Students leave with a clearer idea of streams, courses, entrance exams and how to decide.',
    plan: 'School Awareness Sessions',
    help: [
      'Interactive career awareness sessions for Class 9 and 10: choosing a stream after Class 10.',
      'Seminars for Class 11 and 12: courses, entrance exams (JEE, NEET, MHT CET, CLAT and more) and admission processes.',
      'Workshops on how to choose a career, with time for students’ questions.',
      'Optional sessions for parents on supporting their child’s decision.',
    ],
    steps: [
      ['Contact us', 'Tell us the classes, number of students and preferred dates.'],
      ['Plan the session', 'We agree the topics, format and duration with the school.'],
      ['Session at your school', 'Delivered by our counsellor, with questions and answers.'],
      ['Follow-up', 'Students and parents can book one-to-one counselling if they wish.'],
    ],
    faqs: [
      ['Which classes are the sessions for?', 'Mainly Class 9 to 12. We adapt the content to the age group.'],
      ['Do you visit schools outside Nagpur?', 'Yes, we work with schools across Maharashtra. Contact us to plan dates.'],
      ['How long is a session?', 'It depends on the school’s schedule; we plan the duration and format with you.'],
      ['How do we book?', 'Call, WhatsApp or send the booking form, and mention that it is for a school session.'],
    ],
    blog: ['how-to-choose-a-stream-after-class-10', 'career-options-after-12th-science-pcm-pcb', 'what-is-a-psychometric-test'],
  },
]
