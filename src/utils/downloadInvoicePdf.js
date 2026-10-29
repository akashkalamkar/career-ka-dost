// html2canvas-pro, not html2canvas: the original does not understand the modern "oklab()" colour
// syntax Tailwind CSS v4 generates for every opacity-modifier class (e.g. bg-paper/90) anywhere on
// the page, and hangs instead of failing cleanly. This fork fixes that.
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

/**
 * Turns the printable invoice element into a PDF file that downloads in one click - no browser print
 * dialog, so there is no "Headers and footers" setting to remember to turn off.
 */
export async function downloadInvoicePdf(element, filename) {
  const canvas = await Promise.race([
    html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true }),
    // So a stuck render shows a clear error instead of leaving the button saying "Preparing..." forever.
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out making the PDF.')), 20000)),
  ])
  // JPEG, not PNG: a receipt is almost entirely flat white with text, which PNG does not compress well
  // at this resolution (a plain PNG came out near 10 MB) - JPEG at high quality looks identical here
  // and is a small fraction of the size, so it is easy to email, WhatsApp or keep hundreds of.
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // Almost every bill fits on one page, but a long one (many services) spills onto a second page here
  // rather than getting cut off. A few mm of overflow (font/antialiasing rounding, not real extra
  // content) is absorbed into page one instead, so that alone never spawns an unwanted, near-blank
  // second page.
  const OVERFLOW_TOLERANCE_MM = 15
  let heightLeft = imgHeight - OVERFLOW_TOLERANCE_MM
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
