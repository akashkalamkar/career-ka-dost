/** Update phone, WhatsApp (digits only, country code), and social links for production. */
export const SITE = {
  name: 'Career Ka Dost',
  /** `public/images/logo-mark.png` (full logo: `logo.png`) */
  logoUrl: '/images/logo-mark.png',
  tagline: 'Ask before you decide',
  phoneDisplay: '+91 9503821010',
  phoneDisplay2: '+91 9272397879',
  /** E.164 without + for wa.me */
  whatsappE164: '919503821010',
  phoneTel: '+919503821010',
  phoneTel2: '+919272397879',
  email: 'careerkadost@gmail.com',
  websiteDisplay: 'www.careerkadost.com',
  instagramUrl: 'https://www.instagram.com/careerkadost',
  /** Handle taken from the brochure ("CareerKaDost"). Please confirm it opens your channel. */
  youtubeUrl: 'https://www.youtube.com/@CareerKaDost',
  /** Add your LinkedIn page URL here and a LinkedIn icon appears in the footer and Contact page. */
  linkedinUrl: '',
  /** The "Scan for psychometric test" QR code in the brochure points here. */
  addressLine:
    '2nd Floor, Buty Chambers, opposite Fortune Mall, Sitabuldi, Nagpur, Maharashtra 440012',
  /** Google Maps (short link) */
  mapsUrl: 'https://maps.app.goo.gl/2FcYjpmDKMUZMP239',
  /** Interactive embed (no API key). Update the `q=` text if the office moves. */
  mapEmbedUrl:
    'https://www.google.com/maps?q=Buty+Chambers%2C+opposite+Fortune+Mall%2C+Sitabuldi%2C+Nagpur%2C+Maharashtra+440012&z=16&output=embed',
  copyrightYear: 2026,
}

export const FOUNDER = {
  name: 'Bharat Rai',
  role: 'Founder, Career Ka Dost',
  photo: '/images/founder.png',
  summary: 'Engineer & MBA (Symbiosis, Pune) · Certified Career Counsellor · Corporate Trainer · Public Speaker',
  highlights: [
    'Career guidance and NEET/JEE counselling expert',
    'Conducted workshops for schools, colleges and government bodies',
  ],
  awards: [
    { name: 'Manthan Award', logo: '/images/awards/manthan.png' },
    { name: "Oxford Speakers' Academy", logo: '/images/awards/oxford-speakers-academy.png' },
    { name: 'NIWCYD', logo: '/images/awards/niwcyd.png' },
    { name: 'IIM Nagpur', logo: '/images/awards/iim-nagpur.png' },
    { name: 'MCED', logo: '/images/awards/mced.png' },
  ],
}

export const STATS = [
  { value: '20,000+', label: 'Students counselled across India', icon: 'users' },
  { value: '5,000+', label: 'Youth trained in soft skills and placement readiness', icon: 'board' },
  { value: '4.9', label: 'Google rating', icon: 'star' },
  { value: 'DMIT + AI', label: 'Scientific, assessment-based guidance', icon: 'chip' },
]


/** The online career tests (Google Forms). "Start the test" lets the student choose one of these. */
export const CAREER_TESTS = [
  {
    id: 'psychometric',
    name: 'Psychometric Aptitude Test',
    text: 'Finds your strengths and natural abilities, so you can see which careers fit you best.',
    url: 'https://docs.google.com/forms/d/1_jwugNj1ty-PfgDkU4nOJzuo6dQ0a6TIH74cJtvMB5Y/viewform',
  },
  {
    id: 'interest',
    name: 'Career Interest Inventory',
    text: 'Finds what you enjoy doing, and matches your interests with career paths.',
    url: 'https://docs.google.com/forms/d/182q9E33AsDw0fY4t90VRa4AsU9G0pvGOZu5JO0u__-o/viewform',
  },
]
