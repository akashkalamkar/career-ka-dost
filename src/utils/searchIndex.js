import { FAQS } from '../config/faq'
import { POSTS } from '../config/blog'
import { PRICING_CATEGORIES } from '../config/pricing'
import { PRIVACY, REFUND_POLICY, TERMS } from '../config/legal'
import { RESOURCE_CLASSES } from '../config/resources'

/**
 * Everything the site search can find. Each entry: where to go (`href`), an optional element on that page
 * to scroll to (`anchor`), and the words people might type (`keywords`). Pages, services, questions, blog
 * posts and downloads are added automatically from their config files, so new content becomes searchable by itself.
 */

export const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const PAGES = [
  { title: 'Home', href: '#/', keywords: 'home start main career ka dost' },
  { title: 'About us', href: '#/about', keywords: 'about us company who we are vision mission founder why choose process how it works' },
  { title: 'Pricing and services', href: '#/pricing', keywords: 'pricing price fees cost services plans packages charges rates' },
  { title: 'Career Test', href: '#/career-test', keywords: 'career test psychometric assessment aptitude quiz dmit' },
  { title: 'Results and testimonials', href: '#/results', keywords: 'results testimonials reviews achievers success stories rating toppers' },
  { title: 'Free Resources', href: '#/resources', keywords: 'free resources sample papers downloads pdf practice question papers study material' },
  { title: 'Blog', href: '#/blog', keywords: 'blog articles guides news reading' },
  { title: 'FAQ', href: '#/faq', keywords: 'faq questions answers help doubts' },
  { title: 'Contact and location', href: '#/contact', keywords: 'contact address location map office phone whatsapp email call visit nagpur sitabuldi find us' },
  { title: 'Refund Policy', href: '#/refund-policy', keywords: `refund cancellation cancel money back ${REFUND_POLICY.intro ?? ''}` },
  { title: 'Terms and Conditions', href: '#/terms', keywords: `terms conditions rules ${TERMS.intro ?? ''}` },
  { title: 'Privacy Policy', href: '#/privacy', keywords: `privacy data information safe ${PRIVACY.intro ?? ''}` },
].map((p) => ({ ...p, type: 'Page', detail: '' }))

const SECTIONS = [
  { title: 'Our Vision', href: '#/about', anchor: 'about', keywords: 'vision goal trusted career guidance partner' },
  { title: 'Our Mission', href: '#/about', anchor: 'about', keywords: 'mission clarity confidence correct direction aptitude interests' },
  { title: 'Meet the founder: Bharat Rai', href: '#/about', anchor: 'founder', keywords: 'founder bharat rai engineer mba symbiosis counsellor awards manthan oxford speakers niwcyd iim nagpur mced' },
  { title: 'Why choose Career Ka Dost', href: '#/about', anchor: 'why-us', keywords: 'why choose us trust friends personalised scientific ai dmit nema google rating' },
  { title: 'How it works: four steps', href: '#/about', anchor: 'how-it-works', keywords: 'how it works process steps get in touch share profile plan choose' },
  { title: 'Psychometric Aptitude Test', href: '#/career-test', anchor: 'career-test', keywords: 'psychometric aptitude test career test online start take strengths abilities' },
  { title: 'Career Interest Inventory', href: '#/career-test', anchor: 'career-test', keywords: 'career interest inventory test online start take interests' },
  { title: 'Our track record', href: '#/results', anchor: 'results', keywords: '20000 students counselled 5000 youth trained 4.9 google rating dmit ai numbers' },
  { title: 'Our achievers', href: '#/results', anchor: 'achievers', keywords: 'achievers cap round seat allotted college toppers students congratulations' },
  { title: 'Student testimonials', href: '#/results', anchor: 'testimonials', keywords: 'testimonials reviews feedback aleena shaikh parents words' },
  { title: 'Book your counselling', href: '#/contact', anchor: 'lead-form', keywords: 'book counselling session appointment form enquiry register lead' },
  { title: 'Find our office on the map', href: '#/contact', keywords: 'map directions google maps office address buty chambers fortune mall' },
].map((s) => ({ ...s, type: 'Section', detail: '' }))

const SERVICES = PRICING_CATEGORIES.flatMap((c) =>
  c.plans.map((p) => ({
    type: 'Service',
    title: p.note ? `${p.name} ${p.note}` : p.name,
    detail: c.title,
    href: '#/pricing',
    anchor: `plan-${slug(p.name)}`,
    keywords: `${p.tag ?? ''} ${p.for} ${p.text} ${p.includes.join(' ')} ${c.title}`,
  })),
)

const QUESTIONS = FAQS.map((f) => ({
  type: 'FAQ',
  title: f.q,
  detail: f.category,
  href: '#/faq',
  anchor: `faq-${slug(f.q)}`,
  keywords: f.a,
}))

const ARTICLES = POSTS.map((p) => ({
  type: 'Blog',
  title: p.title,
  detail: p.category,
  href: `#/blog/${p.slug}`,
  keywords: `${p.excerpt} ${p.body.map((b) => b.text ?? (b.items || []).join(' ')).join(' ')}`,
}))

const DOWNLOADS = RESOURCE_CLASSES.flatMap((c) =>
  c.subjects.flatMap((s) => {
    const names = s.options ? s.options.map((o) => `${s.name} (${o.name})`) : []
    const hasFiles = s.options ? s.options.some((o) => o.files.length) : s.files.length
    return [
      {
        type: 'Download',
        title: `${c.label} ${s.name}${hasFiles ? ' sample papers' : ''}`,
        detail: hasFiles ? 'Open resources' : 'Coming soon',
        href: '#/resources',
        anchor: `res-${s.id}`,
        classId: c.id,
        keywords: `${c.label} ${s.name} ${names.join(' ')} sample paper pdf download board exam practice free`,
      },
    ]
  }),
)

const INDEX = [...PAGES, ...SECTIONS, ...SERVICES, ...QUESTIONS, ...ARTICLES, ...DOWNLOADS].map((e) => ({
  ...e,
  _title: e.title.toLowerCase(),
  _keys: (e.keywords || '').toLowerCase(),
}))

/** Entries shown before the visitor has typed anything. */
export const POPULAR = ['Pricing and services', 'Free Resources', 'Career Test', 'Book your counselling', 'Contact and location', 'FAQ']
  .map((t) => INDEX.find((e) => e.title === t))
  .filter(Boolean)

/** Best matches for the typed words. Every word must appear somewhere; titles count most. */
export function searchSite(query, limit = 8) {
  const words = query.toLowerCase().split(/[\s,]+/).filter(Boolean)
  if (!words.length) return []

  const scored = []
  for (const e of INDEX) {
    let score = 0
    let ok = true
    for (const w of words) {
      const inTitle = e._title.includes(w)
      const inKeys = e._keys.includes(w)
      if (!inTitle && !inKeys) {
        ok = false
        break
      }
      if (e._title.startsWith(w)) score += 12
      else if (e._title.split(/\s+/).some((t) => t.startsWith(w))) score += 9
      else if (inTitle) score += 6
      else score += 2
    }
    if (!ok) continue
    if (e.type === 'Page' || e.type === 'Section') score += 1
    scored.push({ e, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.e)
}
