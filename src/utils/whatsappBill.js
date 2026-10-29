import { SITE } from '../config/site'

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

/** ₹11,900 for whole rupees, ₹11,900.50 only when there are paise. */
export function rupees(n) {
  const v = round2(n)
  const paise = Math.round(v * 100) % 100 !== 0
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: paise ? 2 : 0, maximumFractionDigits: 2 })}`
}

const officePhone = () => SITE.phoneDisplay.replace(/^\+91\s*/, '')

// WhatsApp formatting: *text* is bold and _text_ is italic, so *_text_* is both.
// Only emojis inside the Basic Multilingual Plane (one UTF-16 unit, e.g. ☺ ☎ ❗ ✨): WhatsApp on a
// computer turns "double-width" emojis such as 😊 🙏 📞 🔴 into "�" when they arrive through a chat link.
const SMILE = '\u263A\uFE0F' // ☺️
const PHONE = '\u260E\uFE0F' // ☎️
const ALERT = '\u2757' // ❗
const SPARKLE = '\u2728' // ✨
const balanceLine = (inv) => `${ALERT} *_Balance Due: ${rupees(inv.balanceDue)}_*`

export function reminderText(inv) {
  return [
    `Namaste! ${SMILE} Friendly payment reminder from Career Ka Dost.`,
    '',
    `Student: ${inv.studentName}`,
    `Total: ${rupees(inv.total)} | Paid: ${rupees(inv.amountPaid)}`,
    balanceLine(inv),
    '',
    'Kindly clear the pending balance at your earliest convenience. You can pay via Cash, UPI, or Card at our office.',
    '',
    `Thank you! ${SPARKLE}`,
    `Career Ka Dost | ${PHONE} ${officePhone()}`,
  ].join('\n')
}
