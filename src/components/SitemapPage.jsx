import { POSTS } from '../config/blog'
import { SERVICES } from '../config/services'
import { container } from '../config/ui'

const MAIN = [
  ['/', 'Home'],
  ['/about', 'About us'],
  ['/pricing', 'Services and fees'],
  ['/career-test', 'Career test'],
  ['/results', 'Results and testimonials'],
  ['/resources', 'Free resources'],
  ['/blog', 'Blog'],
  ['/faq', 'FAQ'],
  ['/contact', 'Book counselling'],
]
const TOOLS = [
  ['/stream-quiz', 'Free stream quiz (after 10th)'],
  ['/neet-counselling-documents-maharashtra', 'NEET counselling documents checklist'],
]
const LEGAL = [
  ['/refund-policy', 'Refund policy'],
  ['/terms', 'Terms and conditions'],
  ['/privacy', 'Privacy policy'],
]

function Group({ title, items }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {items.map(([href, label]) => (
          <li key={href}>
            <a href={href} className="block py-3 font-semibold hover:text-brass">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Every page on the site in one list: helps visitors and search engines find everything. */
export function SitemapPage() {
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date)).map((p) => [`/blog/${p.slug}`, p.title])
  return (
    <section className="py-16 md:py-24">
      <div className={container}>
        <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">Sitemap</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">Every page of the Career Ka Dost website in one place.</p>
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <Group title="Main pages" items={MAIN} />
          <Group title="Our services" items={SERVICES.map((s) => [`/${s.slug}`, s.menu])} />
          <Group title="Free tools" items={TOOLS} />
          <Group title="Policies" items={LEGAL} />
        </div>
        <div className="mt-12">
          <Group title="Blog articles" items={posts} />
        </div>
      </div>
    </section>
  )
}
