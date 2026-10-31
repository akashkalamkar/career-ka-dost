import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { POSTS } from './src/config/blog.js'
import { allPaths, SITE_URL } from './src/seo.js'
import { prerender } from './scripts/prerender.js'

const root = fileURLToPath(new URL('.', import.meta.url))
const lastmod = Object.fromEntries(POSTS.map((p) => [`/blog/${p.slug}`, p.date]))

/** Writes sitemap.xml at build time, so every page and every blog post is listed for Google without upkeep. */
function sitemap() {
  return {
    name: 'ckd-sitemap',
    generateBundle() {
      const urls = allPaths().map((p) => `  <url><loc>${SITE_URL}${p}</loc>${lastmod[p] ? `<lastmod>${lastmod[p]}</lastmod>` : ''}</url>`)
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml })
    },
  }
}

/** After the build: a ready-made HTML file for every public page (see scripts/prerender.js). */
function prerenderPages() {
  let outDir
  return {
    name: 'ckd-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir.startsWith('/') ? config.build.outDir : `${config.root}/${config.build.outDir}`
    },
    async closeBundle() {
      const count = await prerender(root, outDir)
      console.log(`Prepared ${count} pages for search engines.`)
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
  plugins: [react(), tailwindcss(), sitemap(), prerenderPages()],
})
