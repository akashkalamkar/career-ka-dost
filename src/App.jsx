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
import { PRIVACY, REFUND_POLICY, TERMS } from './config/legal'
import { AdminApp } from './admin/AdminApp'
import { applyPendingJump } from './utils/jump'

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
  '/refund-policy': () => <LegalPage doc={REFUND_POLICY} current="#/refund-policy" />,
  '/terms': () => <LegalPage doc={TERMS} current="#/terms" />,
  '/privacy': () => <LegalPage doc={PRIVACY} current="#/privacy" />,
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

/** The browser-tab title for each page. Pages not listed (home, a blog post) keep the main title. */
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
  let path = window.location.hash.replace(/^#/, '') || '/'
  if (REDIRECTS[path]) path = REDIRECTS[path]
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
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    applyPendingJump()
  }, [route])

  useEffect(() => {
    const isPost = window.location.hash.startsWith('#/blog/')
    document.title = TITLES[route.key] && !isPost ? `${TITLES[route.key]} | Career Ka Dost` : SITE_TITLE
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
