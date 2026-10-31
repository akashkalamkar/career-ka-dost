import { POSTS } from './config/blog.js'

/**
 * What Google sees for each page: title, description, main address and structured data. Used in two
 * places: the browser updates the page head when the visitor moves between pages (App.jsx), and the build
 * writes it into a ready-made HTML file for every page (scripts/prerender.js), so search engines read it
 * without running any code. Plain JavaScript (no JSX) so vite.config.js can import it too.
 */

export const SITE_URL = 'https://www.careerkadost.com'
export const SITE_TITLE = 'Career Ka Dost - Career Counselling & Admission Guidance in Nagpur'
const SITE_DESCRIPTION =
  'Career Ka Dost, Sitabuldi, Nagpur - career guidance and admission counselling for NEET, JEE, MHT-CET, DMIT and college admissions, for students and parents across India. Book counselling today.'

/** The public pages (the staff portal is left out on purpose). */
export const PAGES = {
  '/': { title: null, description: SITE_DESCRIPTION },
  '/about': {
    title: 'About us',
    description: 'Meet Career Ka Dost and founder Bharat Rai: honest, one-to-one career and admission counselling for students and parents in Nagpur and across Maharashtra.',
  },
  '/pricing': {
    title: 'Services & pricing',
    description: 'Career counselling services and fees: Future Blueprint session, DMIT report counselling, engineering and medical counselling, admission guidance and school sessions.',
  },
  '/career-test': {
    title: 'Career test',
    description: 'Take a psychometric aptitude test or a career interest inventory online, then discuss your results with a Career Ka Dost counsellor in Nagpur or online.',
  },
  '/results': {
    title: 'Results & testimonials',
    description: 'Students counselled, achievers admitted through CAP rounds and what students and parents say about Career Ka Dost career counselling in Nagpur.',
  },
  '/resources': {
    title: 'Free resources',
    description: 'Free sample papers and practice PDFs for Class 9, 10, 11 and 12 students. Download, print or solve on screen - from Career Ka Dost, Nagpur.',
  },
  '/blog': {
    title: 'Blog',
    description: 'Guides on career options, MHT CET and NEET counselling in Maharashtra, choosing a stream and a college - for students and parents, from Career Ka Dost.',
  },
  '/faq': {
    title: 'FAQ',
    description: 'Answers to common questions about career counselling, DMIT, NEET, JEE and MHT CET counselling, fees and booking a session with Career Ka Dost, Nagpur.',
  },
  '/contact': {
    title: 'Book counselling',
    description: 'Book career or admission counselling with Career Ka Dost: Buty Chambers, Sitabuldi, Nagpur, or online across Maharashtra. Call, WhatsApp or send the form.',
  },
  '/refund-policy': { title: 'Refund policy', description: 'Refund and cancellation policy for Career Ka Dost counselling sessions and services.' },
  '/terms': { title: 'Terms and conditions', description: 'Terms and conditions for using the Career Ka Dost website and counselling services.' },
  '/privacy': { title: 'Privacy policy', description: 'How Career Ka Dost collects, uses and protects the information you share on this website.' },
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
      title: `${post.title} | Career Ka Dost`,
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
    title: page.title ? `${page.title} | Career Ka Dost` : SITE_TITLE,
    description: page.description,
    url: `${SITE_URL}${key}`,
    type: 'website',
    jsonLd: key === '/' ? [] : [crumb([['Home', '/'], [page.title, key]])],
  }
}

/** Every address that gets its own ready-made page and a place in the sitemap. */
export function allPaths() {
  return [...Object.keys(PAGES), ...POSTS.map((p) => `/blog/${p.slug}`)]
}
