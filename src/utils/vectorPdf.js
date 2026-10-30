import jsPDF from 'jspdf'

/**
 * Builds the bill PDF out of real text, lines and the original image files instead of a screenshot, so
 * everything stays sharp at any zoom (like a PDF saved from Word). How: the bill is copied into a hidden
 * desktop-width frame at exactly A4 width, using the same Figtree font files the PDF embeds, and every
 * word, line, coloured box and picture is drawn into the PDF at the exact spot the browser put it.
 *
 * Throws if anything is not supported (e.g. a name typed in a script Figtree does not have) - the caller
 * then falls back to the older picture-style PDF, so a bill can always be downloaded.
 */

const FONT_FAMILY = 'CKD PDF Figtree'
const FONTS = [
  { weight: 400, style: 'normal', file: 'figtree-400.ttf' },
  { weight: 500, style: 'normal', file: 'figtree-500.ttf' },
  { weight: 600, style: 'normal', file: 'figtree-600.ttf' },
  { weight: 700, style: 'normal', file: 'figtree-700.ttf' },
  { weight: 800, style: 'normal', file: 'figtree-800.ttf' },
  { weight: 400, style: 'italic', file: 'figtree-400-italic.ttf' },
  { weight: 600, style: 'italic', file: 'figtree-600-italic.ttf' },
  { weight: 700, style: 'italic', file: 'figtree-700-italic.ttf' },
]
// Figtree's vertical metrics (per 1 em): where the baseline sits inside a line of text.
const ASCENT = 0.95
const CONTENT_HEIGHT = 1.2
// Characters the font files contain (hex ranges, read from the files themselves).
const SUPPORTED =
  'd,20-7e,a0-ac,ae-ff,102,131,152-153,2c6,2da,2dc,300-301,303-304,308,2013-2014,2018-201a,201c-201e,2022,2026,2039-203a,2044,20ac,2122,2191,2193,2212,2215'
    .split(',')
    .map((r) => r.split('-').map((h) => parseInt(h, 16)))
    .map(([a, b = a]) => [a, b])
const supported = (text) => [...text].every((ch) => /\s/.test(ch) || SUPPORTED.some(([a, b]) => ch.codePointAt(0) >= a && ch.codePointAt(0) <= b))

const A4_WIDTH = 210
const A4_HEIGHT = 297
const NEXT_PAGE_TOP = 10 // mm of white above the first line on pages after the first

let fontCache = null
function loadFonts() {
  if (!fontCache) {
    fontCache = Promise.all(
      FONTS.map(async (f) => {
        const res = await fetch(`${import.meta.env.BASE_URL}fonts/${f.file}`)
        if (!res.ok) throw new Error(`Font ${f.file} not found`)
        return { ...f, bytes: await res.arrayBuffer() }
      }),
    ).catch((err) => {
      fontCache = null
      throw err
    })
  }
  return fontCache
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let out = ''
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(out)
}

/** Any CSS colour (including Tailwind's oklab()/color-mix() ones) as [r, g, b, alpha 0-1], via a 1px canvas. */
function colourReader() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const cache = new Map()
  return (css) => {
    if (!css || css === 'transparent') return null
    if (!cache.has(css)) {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = css
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      // The bill sits on white, so a see-through colour is drawn as the solid colour it shows as.
      const mix = (c) => Math.round(a ? (c * a) / 255 + 255 * (1 - a / 255) : 255)
      cache.set(css, a === 0 ? null : [mix(r), mix(g), mix(b)])
    }
    return cache.get(css)
  }
}

function nearestFont(weight, style) {
  const pool = FONTS.filter((f) => f.style === style)
  return pool.reduce((best, f) => (Math.abs(f.weight - weight) < Math.abs(best.weight - weight) ? f : best))
}
const fontName = (f) => `Figtree-${f.weight}-${f.style}`

/** Copies the bill into a hidden 1280px-wide frame so it lays out exactly like the desktop A4 bill. */
async function layOut(element, fonts) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1280px;height:1800px;border:0;'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  doc.open()
  doc.write('<!doctype html><html><head></head><body></body></html>')
  doc.close()

  const base = doc.createElement('base')
  base.href = document.baseURI
  doc.head.appendChild(base)
  for (const sheet of document.styleSheets) {
    let css
    try {
      css = Array.from(sheet.cssRules, (r) => r.cssText).join('\n')
    } catch {
      continue // another site's stylesheet (Google Fonts) - not needed, the frame has its own fonts
    }
    const style = doc.createElement('style')
    style.textContent = css
    doc.head.appendChild(style)
  }
  const own = doc.createElement('style')
  own.textContent = `body{margin:0;background:#fff}.ckd-pdf-root,.ckd-pdf-root *{font-family:'${FONT_FAMILY}' !important;font-synthesis:none}`
  doc.head.appendChild(own)

  for (const f of fonts) {
    const face = new frame.contentWindow.FontFace(FONT_FAMILY, f.bytes.slice(0), { weight: String(f.weight), style: f.style })
    await face.load()
    doc.fonts.add(face)
  }

  const clone = element.cloneNode(true)
  clone.classList.add('ckd-pdf-root')
  clone.style.width = '210mm'
  clone.style.maxWidth = '210mm'
  clone.style.margin = '0'
  clone.style.boxShadow = 'none'
  doc.body.appendChild(clone)

  await Promise.all(
    Array.from(clone.querySelectorAll('img'), (img) =>
      img.complete && img.naturalWidth
        ? null
        : new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = () => reject(new Error(`Could not load ${img.getAttribute('src')}`))
          }),
    ),
  )
  await doc.fonts.ready
  return { frame, clone }
}

/** Reads every box, line, word and picture of the laid-out bill as drawing steps, in millimetres. */
function collect(clone, win, colour) {
  const origin = clone.getBoundingClientRect()
  const k = A4_WIDTH / origin.width
  const box = (r) => ({ x: (r.left - origin.left) * k, y: (r.top - origin.top) * k, w: r.width * k, h: r.height * k })
  const ops = []
  const range = clone.ownerDocument.createRange()

  function addText(node, cs) {
    const fill = colour(cs.color)
    if (!fill) return
    const font = nearestFont(parseInt(cs.fontWeight, 10) || 400, cs.fontStyle === 'italic' ? 'italic' : 'normal')
    const sizePx = parseFloat(cs.fontSize)
    const upper = cs.textTransform === 'uppercase'
    const spaced = cs.letterSpacing !== 'normal' && parseFloat(cs.letterSpacing) !== 0
    const pieces = []
    const data = node.data
    for (const m of data.matchAll(/\S+/g)) {
      if (spaced) {
        // Letter-spaced text (the small capital headings): place each letter where the browser put it.
        for (let i = 0; i < m[0].length; i++) pieces.push([m.index + i, m.index + i + 1])
      } else {
        pieces.push([m.index, m.index + m[0].length])
      }
    }
    while (pieces.length) {
      const [start, end] = pieces.shift()
      range.setStart(node, start)
      range.setEnd(node, end)
      const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0)
      if (!rects.length) continue
      if (rects.length > 1) {
        // The browser split this word over two lines (e.g. a long word in a narrow column): place it letter by letter.
        if (end - start === 1) throw new Error('Could not place a letter')
        for (let i = end - 1; i >= start; i--) pieces.unshift([i, i + 1])
        continue
      }
      let text = data.slice(start, end)
      if (upper) text = text.toUpperCase()
      if (!supported(text)) throw new Error(`Unsupported character in "${text}"`)
      const r = box(rects[0])
      const baseline = r.y + (r.h - CONTENT_HEIGHT * sizePx * k) / 2 + ASCENT * sizePx * k
      ops.push({ kind: 'text', text, x: r.x, baseline, top: r.y, bottom: r.y + r.h, font, sizePt: sizePx * 0.75, fill })
    }
  }

  function visit(el) {
    const cs = win.getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return
    const r = box(el.getBoundingClientRect())

    const bg = colour(cs.backgroundColor)
    if (bg && el !== clone) ops.push({ kind: 'rect', ...r, fill: bg, big: true })

    const sides = [
      ['Top', (w) => ({ x: r.x, y: r.y, w: r.w, h: w })],
      ['Bottom', (w) => ({ x: r.x, y: r.y + r.h - w, w: r.w, h: w })],
      ['Left', (w) => ({ x: r.x, y: r.y, w, h: r.h })],
      ['Right', (w) => ({ x: r.x + r.w - w, y: r.y, w, h: r.h })],
    ]
    for (const [side, place] of sides) {
      const width = parseFloat(cs[`border${side}Width`]) * k
      const fill = colour(cs[`border${side}Color`])
      if (width > 0 && fill && cs[`border${side}Style`] !== 'none') ops.push({ kind: 'rect', ...place(width), fill, big: side === 'Left' || side === 'Right' })
    }

    if (el.tagName === 'IMG') {
      // object-contain: the picture keeps its shape inside its box, centred.
      const scale = Math.min(r.w / el.naturalWidth, r.h / el.naturalHeight)
      const w = el.naturalWidth * scale
      const h = el.naturalHeight * scale
      const placed = { x: r.x + (r.w - w) / 2, y: r.y + (r.h - h) / 2, w, h }
      ops.push({ kind: el.dataset.pdf === 'qr' ? 'qr' : 'image', img: el, ...placed, top: placed.y, bottom: placed.y + h })
      return
    }

    for (const child of el.childNodes) {
      if (child.nodeType === 1) visit(child)
      else if (child.nodeType === 3 && child.data.trim()) addText(child, cs)
    }
  }

  visit(clone)
  return { ops, height: origin.height * k }
}

/** The QR code as solid squares rather than a picture, so it is perfectly sharp and always scans. */
function qrSquares(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const dark = (x, y) => data[(y * width + x) * 4] < 128
  // Module size = the shortest run of same-coloured pixels along the rows.
  let module = width
  for (let y = 0; y < height; y++) {
    let run = 1
    for (let x = 1; x <= width; x++) {
      if (x < width && dark(x, y) === dark(x - 1, y)) run++
      else {
        if (x < width || run < width) module = Math.min(module, run)
        run = 1
      }
    }
  }
  if (module < 2 || width % module || height % module) throw new Error('QR image is not a clean grid')
  const n = width / module
  const squares = []
  for (let row = 0; row < n; row++) {
    let start = -1
    for (let col = 0; col <= n; col++) {
      const on = col < n && dark(col * module + module / 2, row * module + module / 2)
      if (on && start < 0) start = col
      if (!on && start >= 0) {
        squares.push([start, row, col - start])
        start = -1
      }
    }
  }
  return { n, squares }
}

async function imageBytes(img) {
  const res = await fetch(img.currentSrc || img.src)
  if (!res.ok) throw new Error(`Could not load ${img.getAttribute('src')}`)
  return new Uint8Array(await res.arrayBuffer())
}

/** Where to end a page: in the middle of the white gap closest above the page's full height. */
function pageCut(ops, start, limit) {
  const solid = ops
    .filter((o) => !o.big)
    .map((o) => [o.top ?? o.y, o.bottom ?? o.y + o.h])
    .filter(([a, b]) => b > start && a < limit)
    .sort((p, q) => p[0] - q[0])
  let best = limit
  let reach = start
  let found = false
  for (const [a, b] of solid) {
    if (a > reach && reach > start) {
      best = Math.min((reach + a) / 2, limit)
      found = true
    }
    reach = Math.max(reach, b)
  }
  if (reach < limit && reach > start) return Math.min((reach + limit) / 2, limit)
  return found ? best : limit
}

export async function buildVectorPdf(element) {
  const fonts = await loadFonts()
  const { frame, clone } = await layOut(element, fonts)
  try {
    const { ops, height } = collect(clone, frame.contentWindow, colourReader())

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
    // Only the weights this bill actually uses go into the file, to keep it small.
    const used = new Set(ops.filter((o) => o.kind === 'text').map((o) => o.font.file))
    for (const f of fonts.filter((x) => used.has(x.file))) {
      pdf.addFileToVFS(f.file, toBase64(f.bytes))
      pdf.addFont(f.file, fontName(f), 'normal')
    }
    const images = new Map()
    for (const o of ops) {
      if (o.kind === 'image' && !images.has(o.img.src)) images.set(o.img.src, await imageBytes(o.img))
      if (o.kind === 'qr') o.qr = qrSquares(o.img)
    }

    // Normally the bill is one page. A very long one continues on more pages, cut at a white gap.
    const pages = []
    let start = 0
    while (start < height - 0.5) {
      const top = pages.length ? NEXT_PAGE_TOP : 0
      const end = height - start <= A4_HEIGHT - top ? height : pageCut(ops, start, start + A4_HEIGHT - top)
      pages.push({ start, end, top })
      start = end
    }

    pages.forEach((page, i) => {
      if (i) pdf.addPage()
      const dy = page.top - page.start
      pdf.saveGraphicsState()
      pdf.rect(0, page.top, A4_WIDTH, page.end - page.start, null)
      pdf.clip()
      pdf.discardPath()
      for (const o of ops) {
        const top = o.top ?? o.y
        const bottom = o.bottom ?? o.y + o.h
        if (bottom <= page.start || top >= page.end) continue
        if (o.kind === 'rect') {
          pdf.setFillColor(...o.fill)
          pdf.rect(o.x, o.y + dy, o.w, o.h, 'F')
        } else if (o.kind === 'text') {
          pdf.setFont(fontName(o.font), 'normal')
          pdf.setFontSize(o.sizePt)
          pdf.setTextColor(...o.fill)
          pdf.text(o.text, o.x, o.baseline + dy, { baseline: 'alphabetic' })
        } else if (o.kind === 'image') {
          pdf.addImage(images.get(o.img.src), 'PNG', o.x, o.y + dy, o.w, o.h, o.img.src)
        } else if (o.kind === 'qr') {
          const size = o.w / o.qr.n
          pdf.setFillColor(0, 0, 0)
          // All squares as one shape filled once, so no hairline gaps appear between them.
          for (const [col, row, len] of o.qr.squares) pdf.rect(o.x + col * size, o.y + dy + row * size, len * size, size, null)
          pdf.fill()
        }
      }
      pdf.restoreGraphicsState()
    })
    return pdf
  } finally {
    frame.remove()
  }
}
