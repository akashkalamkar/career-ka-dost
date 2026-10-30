// html2canvas-pro, not html2canvas: the original does not understand the modern "oklab()" colour
// syntax Tailwind CSS v4 generates for every opacity-modifier class (e.g. bg-paper/90) anywhere on
// the page, and hangs instead of failing cleanly. This fork fixes that.
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { buildVectorPdf } from './vectorPdf'

/**
 * Turns the printable invoice element into a PDF file that downloads in one click - no browser print
 * dialog, so there is no "Headers and footers" setting to remember to turn off.
 */
// html2canvas renders from a copy of the page, and that copy re-downloads the site's stylesheet. Right after
// a new deploy, a tab opened earlier still points at the old stylesheet file, which no longer exists, so
// the copy came out unstyled. Using the styles this tab already has in memory avoids that download.
function inlineLoadedStyles(clonedDoc) {
  const readable = []
  for (const sheet of document.styleSheets) {
    if (!sheet.href) continue
    try {
      readable.push({ href: sheet.href, css: Array.from(sheet.cssRules, (r) => r.cssText).join('\n') })
    } catch {
      // Another site's stylesheet (e.g. Google Fonts) cannot be read; leave its link in place.
    }
  }
  for (const link of clonedDoc.querySelectorAll('link[rel="stylesheet"]')) {
    const match = readable.find((s) => s.href === link.href)
    if (!match) continue
    const style = clonedDoc.createElement('style')
    style.textContent = match.css
    link.replaceWith(style)
  }
}

function capture(element, inlineStyles) {
  const options = {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    // On a phone the bill on screen is only as wide as the phone, which would give a thin, stretched
    // PDF over several pages. The copy is laid out in a desktop-width window at exactly A4 width
    // instead, so a phone gets the same one-page A4 bill as a computer.
    windowWidth: Math.max(window.innerWidth, 1280),
    onclone: (clonedDoc, clonedElement) => {
      if (inlineStyles) inlineLoadedStyles(clonedDoc)
      if (clonedElement) {
        clonedElement.style.width = '210mm'
        clonedElement.style.maxWidth = '210mm'
      }
    },
  }
  return Promise.race([
    html2canvas(element, options),
    // So a stuck render shows a clear error instead of leaving the button saying "Preparing..." forever.
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out making the PDF.')), 15000)),
  ])
}

/** True when a row of the image is plain white (ignoring a few pixels at each edge for the bill's border). */
function isBlankRow(ctx, width, y) {
  const edge = 8
  const data = ctx.getImageData(edge, y, width - edge * 2, 1).data
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) return false
  }
  return true
}

/**
 * Where to end a page that starts at row `start`: as close to a full page as possible, but moved up into
 * the middle of the nearest blank gap so a line of text, the QR code or the signature is never cut in
 * half and both pages keep some white space at the cut. Looks back at most a third of a page; falls back
 * to any single blank row, then (very unlikely) to a cut at the full page.
 */
function pageEnd(ctx, width, height, start, pagePx) {
  const full = start + pagePx
  if (full >= height) return height
  const limit = full - Math.floor(pagePx / 3)
  const wanted = 24 // about 3 mm of white at this resolution
  let run = 0
  let firstBlank = -1
  for (let y = full; y > limit; y--) {
    if (isBlankRow(ctx, width, y)) {
      run++
      if (firstBlank === -1) firstBlank = y
      if (run >= wanted) return y + Math.floor(run / 2)
    } else {
      run = 0
    }
  }
  return firstBlank !== -1 ? firstBlank : full
}

export async function downloadInvoicePdf(element, filename) {
  // First choice: a PDF made of real text and the original images, sharp at any zoom (vectorPdf.js).
  // If that ever fails (e.g. a name typed in a script the font does not have), the picture-style PDF
  // below is made instead, so a bill can always be downloaded.
  try {
    const pdf = await buildVectorPdf(element)
    pdf.save(filename)
    return
  } catch (err) {
    console.warn('Sharp PDF not possible, using the picture version instead:', err)
  }
  await downloadPicturePdf(element, filename)
}

async function downloadPicturePdf(element, filename) {
  let canvas
  try {
    canvas = await capture(element, true)
  } catch {
    // Safety net: if copying the styles in ever fails, still try once the plain way.
    canvas = await capture(element, false)
  }
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  // Always full page width - never shrink it to fit, that just leaves odd blank margins down both
  // sides and makes even a correctly-sized page look wrong. A normal bill fits on one page at this
  // width (see PrintableInvoice's own A4-height target). Only a genuinely long one (many services)
  // runs past one page's height, and only then does it continue onto a second, still full-width page,
  // breaking at a blank line (pageEnd) rather than through the middle of the text or the QR code.
  const width = canvas.width
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  // Pages after the first start 10 mm down, so their first line is not right at the paper's edge.
  const nextTopMm = 10
  const pxFor = (mm) => Math.floor((width * mm) / pageWidth)

  let start = 0
  while (start < canvas.height) {
    const topMm = start > 0 ? nextTopMm : 0
    const end = pageEnd(ctx, width, canvas.height, start, pxFor(pageHeight - topMm))
    const slice = document.createElement('canvas')
    slice.width = width
    slice.height = end - start
    slice.getContext('2d').drawImage(canvas, 0, start, width, end - start, 0, 0, width, end - start)
    if (start > 0) pdf.addPage()
    // JPEG, not PNG: a receipt is almost entirely flat white with text, which PNG does not compress well
    // at this resolution (a plain PNG came out near 10 MB) - JPEG at high quality looks identical here
    // and is a small fraction of the size, so it is easy to email, WhatsApp or keep hundreds of.
    pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, topMm, pageWidth, ((end - start) * pageWidth) / width)
    start = end
  }

  pdf.save(filename)
}
