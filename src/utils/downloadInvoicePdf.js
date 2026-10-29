// html2canvas-pro, not html2canvas: the original does not understand the modern "oklab()" colour
// syntax Tailwind CSS v4 generates for every opacity-modifier class (e.g. bg-paper/90) anywhere on
// the page, and hangs instead of failing cleanly. This fork fixes that.
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

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

export async function downloadInvoicePdf(element, filename) {
  let canvas
  try {
    canvas = await capture(element, true)
  } catch {
    // Safety net: if copying the styles in ever fails, still try once the plain way.
    canvas = await capture(element, false)
  }
  // JPEG, not PNG: a receipt is almost entirely flat white with text, which PNG does not compress well
  // at this resolution (a plain PNG came out near 10 MB) - JPEG at high quality looks identical here
  // and is a small fraction of the size, so it is easy to email, WhatsApp or keep hundreds of.
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  // Always full page width - never shrink it to fit, that just leaves odd blank margins down both
  // sides and makes even a correctly-sized page look wrong. A normal bill fits on one page at this
  // width (see PrintableInvoice's own A4-height target). Only a genuinely long one (many services)
  // runs past one page's height, and only then does it continue onto a second, still full-width page.
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position -= pageHeight
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}
