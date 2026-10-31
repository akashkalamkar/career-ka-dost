import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { POSTS } from './src/config/blog.js'

const SITE_URL = 'https://www.careerkadost.com'
// The public pages (same as ROUTES in src/App.jsx, without the staff portal). Blog posts are added automatically.
const PAGES = ['/', '/about', '/pricing', '/career-test', '/results', '/resources', '/blog', '/faq', '/contact', '/refund-policy', '/terms', '/privacy']

/** Writes sitemap.xml at build time, so every page and every blog post is listed for Google without upkeep. */
function sitemap() {
  return {
    name: 'ckd-sitemap',
    generateBundle() {
      const urls = [
        ...PAGES.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`),
        ...POSTS.map((p) => `  <url><loc>${SITE_URL}/blog/${p.slug}</loc><lastmod>${p.date}</lastmod></url>`),
      ]
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml })
    },
  }
}

/** GitHub project Pages use base `/repo-name/`; local dev uses `/`. Set `VITE_BASE_PATH` in CI. */
function viteBase() {
  const raw = process.env.VITE_BASE_PATH?.trim()
  if (!raw) {
    return '/'
  }
  const lead = raw.startsWith('/') ? raw : `/${raw}`
  return lead.endsWith('/') ? lead : `${lead}/`
}

export default defineConfig({
  base: viteBase(),
  plugins: [react(), tailwindcss(), sitemap()],
})
