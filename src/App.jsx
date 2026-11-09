import { Suspense, lazy, startTransition, useEffect, useState } from 'react'
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
import { HomeMore } from './components/HomeMore'
import { LeadForm } from './components/LeadForm'
import { LeadGateModal } from './components/LeadGateModal'
import { LegalPage } from './components/LegalPage'
import { Pricing } from './components/Pricing'
import { Resources } from './components/Resources'
import { Results } from './components/Results'
import { ServicePage } from './components/ServicePage'
import { StreamQuiz } from './components/StreamQuiz'
import { DocumentChecklist } from './components/DocumentChecklist'
import { Breadcrumbs } from './components/Breadcrumbs'
import { MoreInfo } from './components/MoreInfo'
import { SitemapPage } from './components/SitemapPage'
import { NagpurHub } from './components/NagpurHub'
import { NotFound } from './components/NotFound'
import { PRIVACY, REFUND_POLICY, TERMS } from './config/legal'
import { SERVICES } from './config/services'
import { applyPendingJump } from './utils/jump'
import { trackPageView } from './utils/analytics'
import { countThisVisit } from './utils/visits'
import { currentPath, handleLinkClick, ROUTE_EVENT, upgradeOldAddress } from './utils/router'
import { allPaths, pageMeta } from './seo'

// The staff portal is loaded only when someone opens /admin, so website visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp').then((m) => ({ default: m.AdminApp })))

const withCta = (page) => (
  <>
    {page}
    <CtaStrip />
  </>
)

const ROUTES = {
  '/': () => (
    <>
      <Hero />
      <HomeMore />
    </>
  ),
  '/career-counselling-in-nagpur': () => withCta(<NagpurHub />),
  '/about': () => withCta(<About />),
  '/pricing': () => withCta(<Pricing />),
  '/career-test': () => withCta(<CareerTest />),
  '/results': () => withCta(<Results />),
  '/resources': () =>
    withCta(
      <>
        <Resources />
        <MoreInfo page="/resources" />
      </>,
    ),
  '/blog': () => (
    <>
      <Blog />
      <MoreInfo page="/blog" />
    </>
  ),
  '/faq': () => withCta(<Faq />),
  '/stream-quiz': () =>
    withCta(
      <>
        <StreamQuiz />
        <MoreInfo page="/stream-quiz" />
      </>,
    ),
  '/neet-counselling-documents-maharashtra': () => <DocumentChecklist />,
  '/contact': () => (
    <>
      <LeadForm />
      <MoreInfo page="/contact" />
    </>
  ),
  '/sitemap': () => <SitemapPage />,
  '/refund-policy': () => <LegalPage doc={REFUND_POLICY} current="/refund-policy" />,
  '/terms': () => <LegalPage doc={TERMS} current="/terms" />,
  '/privacy': () => <LegalPage doc={PRIVACY} current="/privacy" />,
  ...Object.fromEntries(SERVICES.map((sv) => [`/${sv.slug}`, () => withCta(<ServicePage slug={sv.slug} />)])),
  '/admin': () => (
    <Suspense fallback={<p className="py-24 text-center font-semibold text-mute">Loading the staff portal...</p>}>
      <AdminApp />
    </Suspense>
  ),
}

/** Old addresses keep working: they open the page their content moved to. */
const REDIRECTS = {
  '/services': '/pricing',
  '/why-us': '/about',
  '/process': '/about',
  '/testimonials': '/results',
  '/stories': '/results',
}

/** The page for an address. `path` is given when the build prepares a page ahead of time (no browser). */
function resolve(path) {
  if (path === undefined) {
    path = currentPath()
    if (REDIRECTS[path]) window.history.replaceState(null, '', REDIRECTS[path])
  }
  if (REDIRECTS[path]) path = REDIRECTS[path]
  if (path.startsWith('/blog/')) return { key: '/blog', path, Page: () => <BlogPost slug={path.slice(6)} /> }
  return path in ROUTES ? { key: path, path, Page: ROUTES[path] } : { key: '/404', path, Page: NotFound }
}

function App({ initialPath }) {
  const [route, setRoute] = useState(() => resolve(initialPath))

  useEffect(() => {
    let lastPath = currentPath()
    function onChange() {
      // A transition: the click is answered at once and the new page is drawn just after, which keeps
      // the site quick to respond (Google's "interactivity" score).
      startTransition(() => setRoute(resolve()))
      lastPath = currentPath()
      window.scrollTo(0, 0)
    }
    // A link to a heading on the same page ("#what-is-neet", e.g. "In this article") only scrolls to it.
    const sameShowingPage = () => window.location.hash && !window.location.hash.startsWith('#/') && currentPath() === lastPath
    function onBackForward() {
      if (!sameShowingPage()) onChange()
    }
    window.addEventListener(ROUTE_EVENT, onChange)
    window.addEventListener('popstate', onBackForward)
    // An old-style "#/page" link opened while the site is already on screen.
    function onOldLink() {
      if (sameShowingPage()) return
      upgradeOldAddress()
      onChange()
    }
    window.addEventListener('hashchange', onOldLink)
    document.addEventListener('click', handleLinkClick)
    return () => {
      window.removeEventListener(ROUTE_EVENT, onChange)
      window.removeEventListener('popstate', onBackForward)
      window.removeEventListener('hashchange', onOldLink)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  useEffect(() => {
    applyPendingJump()
    countThisVisit() // once per tab; skipped on the staff portal
  }, [route])

  useEffect(() => {
    const path = currentPath()
    const meta = path === '/admin' ? { ...pageMeta('/'), title: 'Staff portal | Career Ka Dost', url: 'https://www.careerkadost.com/admin' } : pageMeta(path)
    document.title = meta.title
    const set = (selector, attr, value) => document.querySelector(selector)?.setAttribute(attr, value)
    set('meta[name="description"]', 'content', meta.description)
    set('meta[property="og:title"]', 'content', meta.title)
    set('meta[property="og:description"]', 'content', meta.description)
    set('meta[property="og:type"]', 'content', meta.type)
    // Tell Google the one true address of this page (the home page for anything unknown).
    set('link[rel="canonical"]', 'href', meta.url)
    set('meta[property="og:url"]', 'content', meta.url)
    // An address that is not a page: a clear message, and Google is asked not to list it.
    document.head.querySelectorAll('meta[data-ckd-robots]').forEach((m) => m.remove())
    if (route.key === '/404' || (path.startsWith('/blog/') && !allPaths().includes(path))) {
      document.title = 'Page not found | Career Ka Dost'
      const robots = document.createElement('meta')
      robots.name = 'robots'
      robots.content = 'noindex'
      robots.setAttribute('data-ckd-robots', '')
      document.head.appendChild(robots)
    }
    trackPageView() // after the title is set, so the statistics show the right page name
  }, [route])

  const { Page } = route

  return (
    <div className="min-h-svh bg-paper text-ink antialiased">
      <LeadGateModal />
      <Header path={route.key} />
      <main>
        {route.key !== '/admin' ? <Breadcrumbs path={route.path} /> : null}
        <Page />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  )
}

export default App
