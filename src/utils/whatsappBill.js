import { SITE } from '../config/site'
import { whatsappLink, whatsappNumber } from './whatsapp'

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

/** ₹11,900 for whole rupees, ₹11,900.50 only when there are paise. */
export function rupees(n) {
  const v = round2(n)
  const paise = Math.round(v * 100) % 100 !== 0
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: paise ? 2 : 0, maximumFractionDigits: 2 })}`
}

const officePhone = () => SITE.phoneDisplay.replace(/^\+91\s*/, '')

// WhatsApp formatting: *text* is bold and _text_ is italic, so *_text_* is both.
const balanceLine = (inv) => `🔴 *_Balance Due: ${rupees(inv.balanceDue)}_*`

export function reminderText(inv) {
  return [
    'Namaste! 😊 Friendly payment reminder from Career Ka Dost.',
    '',
    `Student: ${inv.studentName}`,
    `Total: ${rupees(inv.total)} | Paid: ${rupees(inv.amountPaid)}`,
    balanceLine(inv),
    '',
    'Kindly clear the pending balance at your earliest convenience. You can pay via Cash, UPI, or Card at our office.',
    '',
    'Thank you! 🙏',
    `Career Ka Dost | 📞 ${officePhone()}`,
  ].join('\n')
}

export function billText(inv) {
  return [
    'Namaste! 😊 Thank you for choosing Career Ka Dost.',
    '',
    `Please find your bill ${inv.invoiceNo} attached.`,
    `Student: ${inv.studentName}`,
    `Total: ${rupees(inv.total)} | Paid: ${rupees(inv.amountPaid)}`,
    ...(inv.balanceDue > 0 ? [balanceLine(inv)] : []),
    '',
    'Thank you! 🙏',
    `Career Ka Dost | 📞 ${officePhone()}`,
  ].join('\n')
}

const isPhone = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

/**
 * Sends the bill PDF towards the parent's WhatsApp. A website cannot attach a file to a WhatsApp chat by
 * itself, so:
 * - on a phone, the phone's Share menu opens with the A4 PDF attached (pick WhatsApp, then the contact);
 * - on a computer (or if sharing is not possible), the PDF downloads and WhatsApp opens on the parent's
 *   chat (the number on the bill) with a ready message, and the staff member attaches the file.
 * Returns { done: 'shared' | 'cancelled' | 'downloaded', link }.
 */
export async function sendBillOnWhatsApp(element, inv) {
  const number = whatsappNumber(inv.phone)
  if (!number) {
    const err = new Error(`The phone number on this bill (${inv.phone || 'blank'}) does not look like a valid mobile number, so WhatsApp cannot be opened for it. Use Download PDF and send it by hand.`)
    err.code = 'phone'
    throw err
  }
  const filename = `${inv.invoiceNo}.pdf`
  const text = billText(inv)
  const link = whatsappLink(number, text)
  const { downloadInvoicePdf, invoicePdfFile } = await import('./downloadInvoicePdf')

  if (isPhone() && typeof navigator.canShare === 'function') {
    const file = await invoicePdfFile(element, filename)
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text })
        return { done: 'shared', link }
      } catch (err) {
        if (err && err.name === 'AbortError') return { done: 'cancelled', link }
        // Sharing refused (for example it took too long after the tap): fall back to download + chat.
      }
    }
  }

  await downloadInvoicePdf(element, filename)
  window.open(link, '_blank', 'noopener,noreferrer')
  return { done: 'downloaded', link }
}
