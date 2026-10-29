// Lists every English text on the translated pages that has no Hindi or Marathi version yet.
// Run: node scripts/check-translations.mjs   (exits with an error if anything is missing)
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { FAQ_CATEGORIES, FAQS } from '../src/config/faq.js'
import { PRICING_CATEGORIES, SERVICE_FINDER } from '../src/config/pricing.js'
import { FOUNDER, SITE, STATS } from '../src/config/site.js'
import HI from '../src/i18n/hi.js'
import MR from '../src/i18n/mr.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

const FILES = [
  'src/App.jsx',
  'src/components/Header.jsx', 'src/components/Hero.jsx', 'src/components/CtaStrip.jsx', 'src/components/FloatingActions.jsx',
  'src/components/Brand.jsx', 'src/components/About.jsx', 'src/components/MissionVision.jsx', 'src/components/WhyChooseUs.jsx',
  'src/components/HowItWorks.jsx', 'src/components/Pricing.jsx', 'src/components/Faq.jsx', 'src/components/SocialLinks.jsx',
  'src/components/LeadForm.jsx', 'src/components/LeadCard.jsx', 'src/components/LeadFields.jsx', 'src/components/LeadGateModal.jsx',
  'src/components/MapEmbed.jsx', 'src/components/Footer.jsx', 'src/components/LangButtons.jsx',
]

const keys = new Set()
for (const file of FILES) {
  const src = read(file)
  // t('...') calls
  for (const m of src.matchAll(/\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/g)) keys.add(m[2].replace(/\\(['"])/g, '$1'))
  // English text kept in small lists at the top of a component (labels, titles, descriptions...)
  for (const m of src.matchAll(/\b(label|title|text|desc|placeholder|t|d|cta|hint)\s*:\s*(['"])((?:\\.|(?!\2).)*)\2/g)) {
    if (/^#|^\//.test(m[3])) continue
    keys.add(m[3].replace(/\\(['"])/g, '$1'))
  }
}
const TITLES_BLOCK = read('src/App.jsx').match(/const TITLES = \{([\s\S]*?)\n\}/)[1]
for (const m of TITLES_BLOCK.matchAll(/:\s*'([^']*)'/g)) keys.add(m[1])
keys.add(read('src/App.jsx').match(/const SITE_TITLE = '([^']*)'/)[1])

FAQ_CATEGORIES.forEach((c) => keys.add(c))
FAQS.forEach((f) => { keys.add(f.q); keys.add(f.a) })
PRICING_CATEGORIES.forEach((c) => {
  keys.add(c.title); keys.add(c.blurb)
  c.plans.forEach((p) => {
    ;['name', 'tag', 'note', 'for', 'text', 'unit'].forEach((k) => p[k] && keys.add(p[k]))
    p.includes.forEach((i) => keys.add(i))
  })
})
SERVICE_FINDER.forEach((f) => { keys.add(f.label); keys.add(f.hint); f.picks.forEach((p) => keys.add(p)) })
STATS.forEach((s) => keys.add(s.label))
keys.add(SITE.tagline); keys.add(FOUNDER.role); keys.add(FOUNDER.summary); FOUNDER.highlights.forEach((h) => keys.add(h))

// Words that are deliberately the same in every language (names, brand words).
const SAME = new Set(['FAQ', 'WhatsApp', 'Instagram', 'YouTube', 'LinkedIn', 'Admin', 'Blog', 'DMIT'])
let missing = 0
for (const [name, dict] of [['Hindi', HI], ['Marathi', MR]]) {
  const gaps = [...keys].filter((k) => k && !SAME.has(k) && !Object.prototype.hasOwnProperty.call(dict, k))
  missing += gaps.length
  if (gaps.length) console.log(`\n${name}: ${gaps.length} missing\n` + gaps.map((g) => JSON.stringify(g)).join('\n'))
  const unused = Object.keys(dict).filter((k) => !keys.has(k))
  if (unused.length) console.log(`\n${name}: ${unused.length} no longer used (safe to delete)\n` + unused.map((g) => JSON.stringify(g)).join('\n'))
  for (const [k, v] of Object.entries(dict)) {
    const want = (k.match(/\{\w+\}/g) || []).sort().join()
    const got = (String(v).match(/\{\w+\}/g) || []).sort().join()
    if (want !== got) { missing++; console.log(`${name}: placeholder mismatch in ${JSON.stringify(k)}`) }
  }
}
console.log(missing ? `\n${missing} problem(s).` : `\nAll ${keys.size} texts translated into Hindi and Marathi.`)
process.exit(missing ? 1 : 0)
