/**
 * Page addresses are normal paths (careerkadost.com/pricing), not "#/pricing", so Google can see and list
 * every page and blog post on its own. Changing page does not reload the site: the address bar is updated
 * and the app draws the new page. vercel.json sends every such address to index.html on a fresh visit.
 */

export const ROUTE_EVENT = 'ckd:route'

/** The current page, e.g. "/pricing" ("/" for home), without a trailing slash. */
export function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

export function navigate(path) {
  if (path !== currentPath() + window.location.search) window.history.pushState(null, '', path)
  window.dispatchEvent(new Event(ROUTE_EVENT))
}

/**
 * Links shared before this change look like careerkadost.com/#/pricing. They still work: the old address is
 * swapped for the new one before the first page is drawn.
 */
export function upgradeOldAddress() {
  const hash = window.location.hash
  if (hash.startsWith('#/')) window.history.replaceState(null, '', hash.slice(1) || '/')
}

/**
 * One click handler for the whole site: a click on a link to one of our own pages changes the page in
 * place instead of reloading. New-tab clicks, downloads and links to other sites behave normally.
 */
export function handleLinkClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = e.target.closest?.('a[href]')
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return
  const href = a.getAttribute('href')
  if (!href.startsWith('/') || href.startsWith('//')) return
  // Files (PDFs, images) are not pages: let the browser open them.
  if (/\.[a-z0-9]+$/i.test(href.split(/[?#]/)[0])) return
  e.preventDefault()
  navigate(href)
}
