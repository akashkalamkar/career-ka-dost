import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Blog } from './components/Blog'
import { BlogPost } from './components/BlogPost'
import { CareerTest } from './components/CareerTest'
import { CtaStrip } from './components/CtaStrip'
import { Faq } from './components/Faq'
import { FloatingActions } from './components/FloatingActions'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { LeadForm } from './components/LeadForm'
import { LeadGateModal } from './components/LeadGateModal'
import { LegalPage } from './components/LegalPage'
import { Pricing } from './components/Pricing'
import { Resources } from './components/Resources'
import { Results } from './components/Results'
import { POSTS } from './config/blog'
import { PRIVACY, REFUND_POLICY, TERMS } from './config/legal'
import { AdminApp } from './admin/AdminApp'
import { applyPendingJump } from './utils/jump'
import { currentPath, handleLinkClick, ROUTE_EVENT, upgradeOldAddress } from './utils/router'

const withCta = (page) => (
  <>
    {page}
    <CtaStrip />
  </>
)

const ROUTES = {
  '/': () => <Hero />,
  '/about': () => withCta(<About />),
  '/pricing': () => withCta(<Pricing />),
  '/career-test': () => withCta(<CareerTest />),
  '/results': () => withCta(<Results />),
  '/resources': () => withCta(<Resources />),
  '/blog': () => <Blog />,
  '/faq': () => withCta(<Faq />),
  '/contact': () => <LeadForm />,
  '/refund-policy': () => <LegalPage doc={REFUND_POLICY} current="/refund-policy" />,
  '/terms': () => <LegalPage doc={TERMS} current="/terms" />,
  '/privacy': () => <LegalPage doc={PRIVACY} current="/privacy" />,
  '/admin': () => <AdminApp />,
}

/** Old addresses keep working: they open the page their content moved to. */
const REDIRECTS = {
  '/services': '/pricing',
  '/why-us': '/about',
  '/process': '/about',
  '/testimonials': '/results',
  '/stories': '/results',
}

const SITE_TITLE = 'Career Ka Dost - Career Counselling & Admission Guidance in Nagpur'

/** The browser-tab title for each page. Home keeps the main title; a blog post uses its own title. */
const TITLES = {
  '/about': 'About us',
  '/pricing': 'Services & pricing',
  '/career-test': 'Career test',
  '/results': 'Results & testimonials',
  '/resources': 'Free resources',
  '/blog': 'Blog',
  '/faq': 'FAQ',
  '/contact': 'Book counselling',
  '/refund-policy': 'Refund policy',
  '/terms': 'Terms and conditions',
  '/privacy': 'Privacy policy',
  '/admin': 'Staff portal',
}

function resolve() {
  let path = currentPath()
  if (REDIRECTS[path]) {
    path = REDIRECTS[path]
    window.history.replaceState(null, '', path)
  }
  if (path.startsWith('/blog/')) return { key: '/blog', Page: () => <BlogPost slug={path.slice(6)} /> }
  return path in ROUTES ? { key: path, Page: ROUTES[path] } : { key: '/', Page: ROUTES['/'] }
}

function App() {
  const [route, setRoute] = useState(resolve)

  useEffect(() => {
    function onChange() {
      setRoute(resolve())
      window.scrollTo(0, 0)
    }
    window.addEventListener(ROUTE_EVENT, onChange)
    window.addEventListener('popstate', onChange)
    // An old-style "#/page" link opened while the site is already on screen.
    function onOldLink() {
      upgradeOldAddress()
      onChange()
    }
    window.addEventListener('hashchange', onOldLink)
    document.addEventListener('click', handleLinkClick)
    return () => {
      window.removeEventListener(ROUTE_EVENT, onChange)
      window.removeEventListener('popstate', onChange)
      window.removeEventListener('hashchange', onOldLink)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  useEffect(() => {
    applyPendingJump()
  }, [route])

  useEffect(() => {
    const path = currentPath()
    const post = path.startsWith('/blog/') ? POSTS.find((p) => path === `/blog/${p.slug}`) : null
    document.title = post ? `${post.title} | Career Ka Dost` : TITLES[route.key] ? `${TITLES[route.key]} | Career Ka Dost` : SITE_TITLE
    // Each blog post gets its own search-result snippet; every other page keeps the one from index.html.
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.dataset.site ??= meta.content
      meta.content = post ? post.excerpt : meta.dataset.site
    }
    // Tell Google the one true address of this page (the home page for anything unknown).
    const url = `https://www.careerkadost.com${route.key === '/' ? '/' : post ? path : route.key}`
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
  }, [route])

  const { Page } = route

  return (
    <div className="min-h-svh bg-paper text-ink antialiased">
      <LeadGateModal />
      <Header path={route.key} />
      <main>
        <Page />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  )
}

export default App
