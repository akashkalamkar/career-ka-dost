/**
 * After `vite build`: writes a ready-made HTML file for every public page (dist/about.html,
 * dist/blog/<slug>.html, ...) with the page's content, title, description, main address and structured
 * data already inside. Search engines can read each page without running any code; visitors see the page
 * at once, and the app then takes over as usual. Run automatically by the plugin in vite.config.js, so
 * Vercel's normal build does it. vercel.json's "cleanUrls" serves /about from about.html.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import react from '@vitejs/plugin-react'
import { build } from 'vite'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Swaps one tag's attribute in the page head; fails loudly if index.html no longer has that tag. */
function setTag(html, pattern, replacement, what) {
  if (!pattern.test(html)) throw new Error(`prerender: could not find ${what} in index.html`)
  return html.replace(pattern, replacement)
}

function pageHtml(template, meta, body, extraHead = '') {
  let html = template
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`, '<title>')
  html = setTag(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${esc(meta.description)}" />`, 'meta description')
  html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${esc(meta.url)}" />`, 'canonical link')
  html = setTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(meta.title)}" />`, 'og:title')
  html = setTag(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${esc(meta.description)}" />`, 'og:description')
  html = setTag(html, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${esc(meta.type)}" />`, 'og:type')
  html = setTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${esc(meta.url)}" />`, 'og:url')
  const ld = (meta.jsonLd || []).map((d) => `    <script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>\n`).join('')
  html = html.replace('</head>', `${ld}${extraHead}  </head>`)
  return setTag(html, /<div id="root"><\/div>/, `<div id="root">${body}</div>`, '<div id="root">')
}

export async function prerender(root, outDir) {
  const ssrDir = join(root, 'node_modules', '.ckd-prerender')
  await build({
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [react()],
    build: { ssr: join(root, 'src/entry-server.jsx'), outDir: ssrDir, emptyOutDir: true },
  })
  const { render } = await import(`${pathToFileURL(join(ssrDir, 'entry-server.js')).href}?t=${Date.now()}`)
  const { allPaths, pageMeta } = await import(`${pathToFileURL(join(root, 'src/seo.js')).href}?t=${Date.now()}`)

  const template = readFileSync(join(outDir, 'index.html'), 'utf8')
  const paths = allPaths()
  for (const path of paths) {
    const file = path === '/' ? join(outDir, 'index.html') : join(outDir, `${path.slice(1)}.html`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, pageHtml(template, pageMeta(path), render(path)))
  }
  // The staff portal: no content ahead of time, and kept out of search results.
  const admin = { ...pageMeta('/'), title: 'Staff portal | Career Ka Dost', url: 'https://www.careerkadost.com/admin', jsonLd: [] }
  writeFileSync(join(outDir, 'admin.html'), pageHtml(template, admin, '', '    <meta name="robots" content="noindex" />\n'))
  rmSync(ssrDir, { recursive: true, force: true })
  return paths.length
}
