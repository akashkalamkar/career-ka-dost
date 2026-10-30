/**
 * Bill generator: service price list and invoice footer details. No GST - Career Ka Dost is not
 * GST-registered, so bills show a plain total (services minus any discount), nothing else.
 *
 * HOW TO EDIT PRICES: change the `price` number below (in rupees, no commas, no symbol) for any service.
 * HOW TO ADD A SERVICE: copy a line and give it a new `id` (lowercase, no spaces) and `name`.
 * These prices are only used on printed bills - they are separate from the public Pricing page, which
 * intentionally shows no numbers yet.
 */
export const SERVICES = [
  { id: 'future-blueprint', name: 'Future Blueprint Session', price: 214 },
  { id: 'dmit', name: 'DMIT (Test & Report Counselling)', price: 2000 },
  { id: 'engineering-counselling', name: 'Engineering Counselling (JoSAA / MHT-CET)', price: 15000 },
  { id: 'medical-counselling', name: 'Medical Counselling (MCC / State CET)', price: 15000 },
  // No fixed price (depends on course, college and admission quota / on the school): staff type the amount on each bill.
  { id: 'admission-guidance', name: 'Admission Guidance (Law / BBA / MBA / B.Sc / BCA)', price: null },
  { id: 'school-session', name: 'School Awareness Session', price: null },
]

/** Shown on the printed invoice footer. */
export const INVOICE = {
  prefix: 'CKD',
  signatureUrl: '/images/signature.png',
  signatureName: 'Bharat Rai', // PLACEHOLDER signature image - replace public/images/signature.png with the real one later
  signatureRole: 'Founder, Career Ka Dost',
  footerNote: 'Thank you for choosing Career Ka Dost. This is a computer-generated receipt.',
}

export const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Bank transfer']
