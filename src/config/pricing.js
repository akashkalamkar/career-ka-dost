/**
 * Services and pricing, shown on the Pricing page.
 *
 * HOW TO ADD A PRICE: set `price` to a string such as '₹1,500' (and `unit` such as 'per session').
 * While `price` is empty the card shows "Price on request" and a "Get a quote" button, so no wrong
 * number is ever published. Service names and details come from the Career Ka Dost brochure.
 */
export const PRICING_CATEGORIES = [
  {
    id: 'plan',
    title: 'Career planning',
    blurb: 'For students deciding a stream, a course or a long-term path.',
    plans: [
      {
        name: 'Future Blueprint Session',
        for: 'Class 9 to 12 students and parents',
        text: 'A one-on-one strategic session to plan your future, set goals and map the right career path.',
        includes: ['One-on-one strategic session', 'Goal setting', 'A clear career path map'],
        price: '',
        unit: 'per session',
      },
      {
        name: 'DMIT',
        note: '(Test & Report Counselling)',
        for: 'Students who want a scientific starting point',
        text: 'Expert counselling based on your DMIT report, to align your career with your innate potential.',
        includes: ['DMIT assessment report', 'Expert counselling on the report', 'Career aligned to your potential'],
        price: '',
        unit: 'per student',
      },
    ],
  },
  {
    id: 'admission',
    title: 'Admission counselling',
    blurb: 'Step-by-step help through counselling rounds and seat allotment.',
    plans: [
      {
        name: 'Engineering Counselling',
        tag: 'JoSAA and MHT-CET',
        for: 'JEE and CET students',
        text: 'Guidance for engineering admission through JoSAA and MHT-CET.',
        includes: ['JoSAA guidance', 'MHT-CET counselling guidance', 'Branch and college shortlisting'],
        price: '',
        unit: 'per student',
      },
      {
        name: 'Medical Counselling',
        tag: 'MCC and state CET',
        for: 'NEET students',
        text: 'Guidance for medical admission through MCC and state CET.',
        includes: ['MCC counselling guidance', 'State CET counselling guidance', 'College and quota shortlisting'],
        price: '',
        unit: 'per student',
      },
      {
        name: 'Admission Guidance',
        tag: 'Law, BBA, MBA, B.Sc, BCA',
        for: 'Students applying beyond engineering and medical',
        text: 'Complete admission support for Law, BBA, MBA, B.Sc and BCA courses.',
        includes: ['Law, BBA, MBA', 'B.Sc and BCA', 'End-to-end admission support'],
        price: '',
        unit: 'per student',
      },
    ],
  },
  {
    id: 'schools',
    title: 'For schools',
    blurb: 'Awareness sessions that help whole classes make better decisions.',
    plans: [
      {
        name: 'School Awareness Sessions',
        for: 'Schools and institutions',
        text: 'Career awareness and future-decision sessions for schools.',
        includes: ['Career awareness session', 'Future-decision guidance', 'Delivered for your students'],
        price: '',
        unit: 'per session',
      },
    ],
  },
]

/** "Which service is right for me?" helper on the Pricing page. */
export const SERVICE_FINDER = [
  {
    id: 'c10',
    label: 'Class 9 or 10 student',
    hint: 'Choosing a stream',
    picks: ['Future Blueprint Session', 'DMIT (Test & Report Counselling)'],
  },
  {
    id: 'c12',
    label: 'Class 12, NEET or JEE',
    hint: 'Heading to counselling rounds',
    picks: ['Engineering Counselling', 'Medical Counselling'],
  },
  {
    id: 'other',
    label: 'Law, BBA, MBA, B.Sc, BCA',
    hint: 'Applying to other courses',
    picks: ['Admission Guidance', 'Future Blueprint Session'],
  },
  {
    id: 'school',
    label: 'School or institution',
    hint: 'For a whole class or batch',
    picks: ['School Awareness Sessions'],
  },
  {
    id: 'unsure',
    label: 'Not sure yet',
    hint: 'Start with the basics',
    picks: ['DMIT (Test & Report Counselling)', 'Future Blueprint Session'],
  },
]
