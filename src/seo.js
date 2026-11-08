import { POSTS } from './config/blog.js'
import { FAQS } from './config/faq.js'
import { SERVICES } from './config/services.js'
import { FOUNDER } from './config/site.js'

/**
 * What Google sees for each page: title, description, main address and structured data. Used in two
 * places: the browser updates the page head when the visitor moves between pages (App.jsx), and the build
 * writes it into a ready-made HTML file for every page (scripts/prerender.js), so search engines read it
 * without running any code. Plain JavaScript (no JSX) so vite.config.js can import it too.
 */

export const SITE_URL = 'https://www.careerkadost.com'
export const SITE_TITLE = 'Best Career Counsellor in Nagpur & Online | Career Ka Dost'
const SITE_DESCRIPTION =
  'Career counsellor in Nagpur since 2023: 20,000+ students guided, 4.9 on Google. Stream choice, NEET, MHT CET, JoSAA, DMIT - in Sitabuldi or online.'

/** The public pages (the staff portal is left out on purpose). */
export const PAGES = {
  '/': { title: null, description: SITE_DESCRIPTION },
  '/about': {
    title: 'About us',
    fullTitle: 'About Bharat Rai – Top Career Counsellor in Nagpur',
    description: 'Meet Bharat Rai, founder of Career Ka Dost (since 2023): honest one-to-one career and admission counselling in Nagpur and online, in English, Hindi and Marathi.',
  },
  '/pricing': {
    title: 'Services & pricing',
    fullTitle: 'Career Counselling Services & Fees | Career Ka Dost',
    description: 'Career counselling services and fees: Future Blueprint session, DMIT, engineering (JoSAA, MHT CET) and medical counselling, admission guidance, school sessions.',
  },
  '/career-test': {
    title: 'Career test',
    fullTitle: 'Online Career Test – Aptitude & Interest | Career Ka Dost',
    description: 'Take a psychometric aptitude test or a career interest inventory online, then discuss your results with a Career Ka Dost counsellor in Nagpur or online.',
  },
  '/results': {
    title: 'Results & testimonials',
    fullTitle: 'Results & Student Testimonials | Career Ka Dost',
    description: 'Students counselled, achievers admitted through CAP rounds and what students and parents say about Career Ka Dost career counselling in Nagpur.',
  },
  '/resources': {
    title: 'Free resources',
    fullTitle: 'Free Sample Papers & Practice PDFs | Career Ka Dost',
    description: 'Free sample papers and practice PDFs for Class 9, 10, 11 and 12 students. Download, print or solve on screen - from Career Ka Dost, Nagpur.',
  },
  '/blog': {
    title: 'Blog',
    fullTitle: 'Career Guidance Blog: NEET, MHT CET & More | Career Ka Dost',
    description: 'Guides on career options, MHT CET and NEET counselling in Maharashtra, choosing a stream and a college - for students and parents, from Career Ka Dost.',
  },
  '/faq': {
    title: 'FAQ',
    fullTitle: 'Career Counselling FAQs – Fees, DMIT, NEET | Career Ka Dost',
    description: 'Answers to common questions about career counselling, DMIT, NEET, JEE and MHT CET counselling, fees and booking a session with Career Ka Dost, Nagpur.',
  },
  '/contact': {
    title: 'Book counselling',
    fullTitle: 'Book a Career Counsellor – Nagpur & Online | Career Ka Dost',
    description: 'Book career counselling with Career Ka Dost: Buty Chambers, Sitabuldi, Nagpur (Mon-Sat, 10 am-6 pm) or online across India. Call, WhatsApp or send the form.',
  },
  '/stream-quiz': {
    title: 'Stream quiz',
    fullTitle: 'Which Stream After 10th? Free Quiz | Career Ka Dost',
    description: 'Free 3-minute quiz for Class 9 and 10 students: 12 everyday questions to find whether Science (PCM or PCB), Commerce or Arts suits you best.',
  },
  '/neet-counselling-documents-maharashtra': {
    title: 'NEET documents checklist',
    fullTitle: 'NEET Counselling Documents List 2026 – Maharashtra',
    description: 'Free checklist of documents for NEET UG 2026 Maharashtra state quota counselling (MBBS, BDS, BAMS, BHMS, BPTh) from the State CET Cell. Tick, print, share.',
  },
  '/refund-policy': { title: 'Refund policy', description: 'Refund and cancellation policy for Career Ka Dost counselling sessions and services: when you can cancel, reschedule or get a refund, in plain language.' },
  '/terms': { title: 'Terms and conditions', description: 'Terms and conditions for using the Career Ka Dost website and booking our counselling services, including what we provide and your responsibilities.' },
  '/privacy': { title: 'Privacy policy', description: 'How Career Ka Dost collects, uses and protects the personal information you share on this website, including forms, WhatsApp, analytics and your choices.' },
  // Service pages (src/config/services.js) use their own full title, without the ' | Career Ka Dost' ending.
  ...Object.fromEntries(SERVICES.map((sv) => [`/${sv.slug}`, { title: sv.menu, fullTitle: sv.title, description: sv.description }])),
}

const BUSINESS_ID = `${SITE_URL}/#business`
const crumb = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${path}` })),
})

/**
 * Everything for the page at `path`. Unknown addresses get the home page's details (that is what the
 * site shows for them). `jsonLd` is the extra structured data for this page; the business details are
 * on every page already (index.html).
 */
export function pageMeta(path) {
  const post = path.startsWith('/blog/') ? POSTS.find((p) => path === `/blog/${p.slug}`) : null
  if (post) {
    const url = `${SITE_URL}/blog/${post.slug}`
    return {
      // A shorter `seoTitle` (blog.js) is used for Google when the article title is long; ~60 characters show in results.
      title: `${post.seoTitle || post.title} | Career Ka Dost`.length <= 60 ? `${post.seoTitle || post.title} | Career Ka Dost` : post.seoTitle || post.title,
      description: post.excerpt,
      url,
      type: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          dateModified: post.date,
          inLanguage: 'en-GB',
          url,
          mainEntityOfPage: url,
          image: `${SITE_URL}/images/share.jpg`,
          articleSection: post.category,
          author: { '@type': 'Person', name: 'Bharat Rai', url: `${SITE_URL}/about` },
          publisher: { '@id': BUSINESS_ID, '@type': 'Organization', name: 'Career Ka Dost', logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` } },
        },
        crumb([
          ['Home', '/'],
          ['Blog', '/blog'],
          [post.title, `/blog/${post.slug}`],
        ]),
      ],
    }
  }
  const key = path in PAGES ? path : '/'
  const page = PAGES[key]
  return {
    title: page.fullTitle || (page.title ? `${page.title} | Career Ka Dost` : SITE_TITLE),
    description: page.description,
    url: `${SITE_URL}${key}`,
    type: 'website',
    jsonLd: key === '/' ? [] : [crumb([['Home', '/'], [page.title, key]]), ...extraJsonLd(key)],
  }
}

/** Question-and-answer data for Google and AI answers. */
const faqPage = (pairs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pairs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
})

/** Extra structured data for some pages: the founder on About, questions and answers on FAQ and service pages. */
function extraJsonLd(key) {
  if (key === '/about') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${SITE_URL}/about#founder`,
        name: FOUNDER.name,
        jobTitle: FOUNDER.role,
        description: FOUNDER.summary,
        image: `${SITE_URL}${FOUNDER.photo}`,
        url: `${SITE_URL}/about`,
        worksFor: { '@id': BUSINESS_ID, '@type': 'Organization', name: 'Career Ka Dost' },
        alumniOf: { '@type': 'EducationalOrganization', name: 'Symbiosis, Pune' },
        knowsAbout: ['Career counselling', 'Admission counselling', 'NEET counselling', 'MHT CET counselling', 'JEE and JoSAA counselling', 'DMIT', 'Psychometric assessment'],
        knowsLanguage: ['en', 'hi', 'mr'],
      },
    ]
  }
  if (key === '/faq') return [faqPage(FAQS.map((f) => [f.q, f.a]))]
  const service = SERVICES.find((sv) => key === `/${sv.slug}`)
  return service ? [faqPage(service.faqs)] : []
}

/** Every address that gets its own ready-made page and a place in the sitemap. */
export function allPaths() {
  return [...Object.keys(PAGES), ...POSTS.map((p) => `/blog/${p.slug}`)]
}
