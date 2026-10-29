const B = 'http://localhost:8787'
// Usernames are fixed now. The tests keep using plain names (bharat, kalpak...), and this wrapper turns
// them into the real fixed usernames, and turns the replies back, so the old checks still read the same.
const actual = { bharat: 'brxxckd1010', kalpak: 'kalpak1484', riya: 'riya2026', tina: 'tina2026' }
const rawPost = async (body) => (await fetch(B, { method: 'POST', body: JSON.stringify(body) })).json()
const firstPw = (v) => {
  if (typeof v !== 'string') return v
  const m = v.match(/^(\w+)@123\d?$/)
  return m && actual[m[1]] ? actual[m[1]] + '@123' : v
}
const post = async (input) => {
  const body = { ...input }
  if (body.username && actual[String(body.username).toLowerCase()]) body.username = actual[String(body.username).toLowerCase()]
  body.password = firstPw(body.password)
  body.current = firstPw(body.current)
  body.next = firstPw(body.next)
  const r = await rawPost(body)
  let s = JSON.stringify(r)
  for (const [name, real] of Object.entries(actual)) s = s.split('"' + real + '"').join('"' + name + '"')
  return JSON.parse(s)
}
const clock = (v) => fetch(B + '/__time?ist=' + v).then((r) => r.text())
let pass = 0, bad = 0
const t = (name, cond, extra) => { cond ? pass++ : bad++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  ' + JSON.stringify(extra))) }

async function loginAs(u, first, next) {
  let r = await post({ action: 'login', username: u, password: first })
  await post({ action: 'changePassword', token: r.token, current: first, next })
  r = await post({ action: 'login', username: u, password: next })
  return r
}

;(async () => {
  await clock('2026-10-29T12:00:00')
  const kb = await loginAs('kalpak', 'kalpak@123', 'KalpakNew2026'); const k = kb.token
  const ob = await loginAs('bharat', 'bharat@123', 'BharatNew2026'); const o = ob.token

  // basic validation
  let r = await post({ action: 'createInvoice', token: k, phone: '9999999999', items: [{ name: 'DMIT', price: 3500 }] })
  t('missing student name rejected', !r.ok && /name/i.test(r.error), r)
  r = await post({ action: 'createInvoice', token: k, studentName: 'Riya Sharma', items: [{ name: 'DMIT', price: 3500 }] })
  t('missing phone rejected', !r.ok && /phone/i.test(r.error), r)
  r = await post({ action: 'createInvoice', token: k, studentName: 'Riya Sharma', phone: '9999999999', items: [] })
  t('no services rejected', !r.ok && /service/i.test(r.error), r)
  r = await post({ action: 'createInvoice', token: k, studentName: 'Riya Sharma', phone: '9999999999', items: [{ name: '', price: 100 }] })
  t('a blank service name is rejected', !r.ok, r)
  r = await post({ action: 'createInvoice', token: k, studentName: 'Riya Sharma', phone: '9999999999', items: [{ name: 'DMIT', price: -5 }] })
  t('a negative price is rejected', !r.ok, r)

  // a simple no-discount bill (no GST - Career Ka Dost is not GST-registered)
  r = await post({
    action: 'createInvoice', token: k,
    studentName: 'Riya Sharma', phone: '9999999999', classOrCourse: 'Class 10', city: 'Nagpur',
    items: [{ name: 'DMIT (Test & Report Counselling)', price: 3500 }],
    discountMode: 'percent', discountPercent: 0,
    paymentMode: 'Cash', paymentStatus: 'Paid in full',
  })
  t('first invoice is created and numbered CKD-0001', r.ok && r.invoice.invoiceNo === 'CKD-0001', r)
  t('subtotal and total both equal the one service price', r.ok && r.invoice.subtotal === 3500 && r.invoice.total === 3500, r.invoice)
  t('it records who made it', r.ok && r.invoice.createdByUsername === 'kalpak' && r.invoice.createdByName === 'Kalpak Dorlikar', r.invoice)
  t('amount paid equals the total and there is no balance due', r.ok && r.invoice.amountPaid === 3500 && r.invoice.balanceDue === 0, r.invoice)

  // invoice numbers increase even across different staff members
  r = await post({
    action: 'createInvoice', token: o,
    studentName: 'Tina Verma', phone: '8888888888',
    items: [{ name: 'Future Blueprint Session', price: 2000 }],
    discountMode: 'percent', discountPercent: 0,
    paymentMode: 'UPI', paymentStatus: 'Paid in full',
  })
  t('second invoice (made by the owner) is numbered CKD-0002', r.ok && r.invoice.invoiceNo === 'CKD-0002', r)

  // two services on one bill, with a percent discount
  r = await post({
    action: 'createInvoice', token: k,
    studentName: 'Aman Gupta', phone: '7777777777',
    items: [
      { name: 'DMIT (Test & Report Counselling)', price: 3500 },
      { name: 'Future Blueprint Session', price: 2000 },
    ],
    discountMode: 'percent', discountPercent: 10,
    paymentMode: 'Cash', paymentStatus: 'Paid in full',
  })
  t('subtotal is the sum of both services', r.ok && r.invoice.subtotal === 5500, r.invoice)
  t('a 10% discount computes to 550', r.ok && r.invoice.discountAmount === 550, r.invoice)
  t('total after the discount is 4950', r.ok && r.invoice.total === 4950, r.invoice)

  // the same discount, but typed as a rupee amount instead of a percent
  r = await post({
    action: 'createInvoice', token: k,
    studentName: 'Simran Kaur', phone: '6666666666',
    items: [{ name: 'DMIT (Test & Report Counselling)', price: 3500 }],
    discountMode: 'amount', discountAmount: 500,
    paymentMode: 'Cash', paymentStatus: 'Paid in full',
  })
  t('a 500 rupee discount on 3500 works out to the matching percent', r.ok && r.invoice.discountAmount === 500 && Math.abs(r.invoice.discountPercent - 14.29) < 0.1, r.invoice)
  r = await post({
    action: 'createInvoice', token: k,
    studentName: 'Simran Kaur', phone: '6666666666',
    items: [{ name: 'DMIT (Test & Report Counselling)', price: 3500 }],
    discountMode: 'amount', discountAmount: 9999,
  })
  t('a discount bigger than the subtotal is rejected', !r.ok, r)

  // partial payment
  r = await post({
    action: 'createInvoice', token: k,
    studentName: 'Partial Payer', phone: '3333333333',
    items: [{ name: 'Engineering Counselling', price: 5000 }],
    discountMode: 'percent', discountPercent: 0,
    paymentMode: 'Cash', paymentStatus: 'Partially paid', amountPaid: 2000,
  })
  t('a partial payment leaves the right balance due', r.ok && r.invoice.amountPaid === 2000 && r.invoice.balanceDue === 3000, r.invoice)

  // listing: the owner sees every invoice, an employee sees only their own
  r = await post({ action: 'listInvoices', token: o })
  t('the owner sees all 5 invoices made so far (the rejected over-discount one never saved a row)', r.ok && r.invoices.length === 5 && r.isOwner === true, r.invoices.length)
  r = await post({ action: 'listInvoices', token: k })
  t('kalpak sees only the invoices he made himself', r.ok && r.isOwner === false && r.invoices.every((inv) => inv.createdByUsername === 'kalpak'), r.invoices)
  t('newest invoice is listed first', r.ok && r.invoices[0].studentName === 'Partial Payer', r.invoices[0])

  // a listed invoice carries its services as structured items too, not just the printed text summary,
  // so a past bill can be rebuilt and re-downloaded exactly (not just read)
  const amanInvoice = r.invoices.find((inv) => inv.studentName === 'Aman Gupta')
  t(
    'a listed invoice carries structured items (name + price), not just the text summary',
    Array.isArray(amanInvoice.items) &&
      amanInvoice.items.length === 2 &&
      amanInvoice.items.some((it) => it.name === 'DMIT (Test & Report Counselling)' && it.price === 3500) &&
      amanInvoice.items.some((it) => it.name === 'Future Blueprint Session' && it.price === 2000),
    amanInvoice,
  )

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
