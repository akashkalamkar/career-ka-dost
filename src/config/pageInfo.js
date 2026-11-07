/**
 * Extra helpful text shown under some pages (MoreInfo.jsx), so each page explains itself to visitors and
 * Google (an SEO audit flagged these pages as having too few words). Same format as blog posts:
 * h = heading, p = paragraph, ul = list. "[text](/path)" becomes a link.
 */
export const PAGE_INFO = {
  '/blog': [
    { type: 'h', text: 'What you will find on this blog' },
    { type: 'p', text: 'Admission rules in Maharashtra change every year, and most families hear them second-hand. Our articles explain each process in plain language, step by step, using official sources such as the State CET Cell, Maharashtra, the Medical Counselling Committee (MCC), JoSAA and the National Testing Agency. Each article ends with what you should actually do next.' },
    { type: 'ul', items: [
      'Engineering admissions: the [MHT CET CAP round process](/blog/mht-cet-cap-round-process-maharashtra-engineering-admission) and [JoSAA counselling for IITs, NITs and IIITs](/blog/josaa-counselling-explained-for-parents).',
      'Medical admissions: [Maharashtra NEET state quota counselling](/blog/maharashtra-neet-counselling-state-quota-mbbs-bams-bds), [All India Quota vs State Quota](/blog/neet-counselling-all-india-quota-vs-state-quota) and our free [NEET documents checklist](/neet-counselling-documents-maharashtra).',
      'Choosing a stream and a career: [how to choose a stream after 10th](/blog/how-to-choose-a-stream-after-class-10), the free [stream quiz](/stream-quiz) and [career options after 12th Science](/blog/career-options-after-12th-science-pcm-pcb).',
      'Choosing well: [what a psychometric test is](/blog/what-is-a-psychometric-test), [questions to ask before choosing a college](/blog/questions-to-ask-before-choosing-a-college) and [how to find the best career counsellor in Nagpur](/blog/career-counselling-in-nagpur-how-to-choose-a-career-counsellor).',
    ] },
    { type: 'h', text: 'Need advice for your own situation?' },
    { type: 'p', text: 'An article explains the rules; a counselling session applies them to your marks, rank, category, budget and goals. [Book a session](/contact) at our office in Sitabuldi, Nagpur, or online from anywhere in India, in English, Hindi or Marathi.' },
  ],
  '/contact': [
    { type: 'h', text: 'What happens after you book' },
    { type: 'ul', items: [
      'We reply on WhatsApp to confirm a day and time that suits the family. Office hours are Monday to Saturday, 10 am to 6 pm.',
      'You share the basics: class, marks, entrance exam score or rank, and the questions you want answered.',
      'The session: a one-to-one conversation with the student and parents together, in person or online, in English, Hindi or Marathi.',
      'You leave with a clear plan and next steps, with follow-up on WhatsApp during admission season.',
    ] },
    { type: 'h', text: 'Coming from outside Nagpur?' },
    { type: 'p', text: 'Our office in Sitabuldi is in the centre of Nagpur, easy to reach by road or rail. Many families travel from [Bhandara, Chandrapur, Wardha, Gondia and Amravati](/career-counselling-vidarbha); if travel is difficult, [online career counselling](/online-career-counselling-maharashtra) works just as well.' },
    { type: 'h', text: 'What to keep ready' },
    { type: 'ul', items: [
      'Class 10 and Class 12 marksheets (or the latest school results).',
      'Entrance exam score card or rank, such as MHT CET, JEE or NEET, if you have one.',
      'Category, domicile and other certificates if you need admission guidance - see our [NEET documents checklist](/neet-counselling-documents-maharashtra).',
      'A list of the questions and worries you want to discuss.',
    ] },
    { type: 'p', text: 'Fees for each service are on our [services and fees](/pricing) page.' },
  ],
  '/resources': [
    { type: 'h', text: 'How to get the most from these practice papers' },
    { type: 'ul', items: [
      'Solve each paper in one sitting, with the same time limit as the real exam.',
      'Check your answers honestly and mark the chapters where you lost marks.',
      'Revise those chapters, then try another paper a week later and compare.',
      'Need a paper for a subject that is not listed yet? Ask us on WhatsApp and we will share it when it is ready.',
    ] },
    { type: 'p', text: 'All papers on this page are free for students of Class 9, 10, 11 and 12. You can download them, print them or solve them on screen.' },
    { type: 'h', text: 'Beyond marks: plan your next step' },
    { type: 'p', text: 'Good marks open doors, but choosing the right door matters just as much. Class 9 and 10 students can take the free [stream quiz](/stream-quiz) and read about [career counselling after 10th](/career-counselling-after-10th-nagpur). Class 11 and 12 students can explore [career counselling after 12th](/career-counselling-after-12th-nagpur), [MHT CET counselling](/mht-cet-counselling-nagpur) and [NEET counselling](/neet-counselling-maharashtra).' },
  ],
  '/stream-quiz': [
    { type: 'h', text: 'How this quiz works' },
    { type: 'p', text: 'The quiz has 12 questions about everyday situations - how you spend free time, what kind of mistakes bother you, what you would be proud of in fifteen years. There are no school subjects or marks in it. Each answer points to one of four streams: Science with Maths (PCM), Science with Biology (PCB), Commerce, or Arts and Humanities. Your result shows the stream you lean towards most, the next closest one, and how your answers were spread across all four.' },
    { type: 'h', text: 'What each stream can lead to' },
    { type: 'ul', items: [
      'Science (PCM): engineering, architecture, computer science, data science, pure sciences, defence and more.',
      'Science (PCB): medicine (MBBS, BDS, BAMS, BHMS), nursing, physiotherapy, pharmacy, biotechnology and life sciences.',
      'Commerce: CA, CS, CMA, B.Com, BBA, economics, banking, finance, business and management.',
      'Arts / Humanities: law, psychology, journalism and media, design, civil services, languages and social sciences.',
    ] },
    { type: 'h', text: 'What to do with your result' },
    { type: 'ul', items: [
      'Talk it over with your parents - the quiz is a starting point for that conversation, not the final word.',
      'Check your marks and comfort in the key subjects: Maths for PCM, Biology for PCB, and so on.',
      'For a detailed picture of your aptitude and interests, take the full [psychometric career test](/career-test).',
      'Read [how to choose a stream after 10th](/blog/how-to-choose-a-stream-after-class-10), or [book a counselling session](/contact) to decide with expert guidance.',
    ] },
  ],
}
