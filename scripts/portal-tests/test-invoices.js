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

  // recording money received later against a bill with a balance due
  const partial = r.invoices.find((inv) => inv.studentName === 'Partial Payer')
  t('a listed invoice does not expose the internal sheet row', partial && !('row' in partial), partial)
  t('a new bill starts with no later payments', Array.isArray(partial.payments) && partial.payments.length === 0, partial)
  r = await post({ action: 'recordPayment', token: k, invoiceNo: partial.invoiceNo, amount: 0 })
  t('a zero payment is rejected', !r.ok, r)
  r = await post({ action: 'recordPayment', token: k, invoiceNo: partial.invoiceNo, amount: -100 })
  t('a negative payment is rejected', !r.ok, r)
  r = await post({ action: 'recordPayment', token: k, invoiceNo: partial.invoiceNo, amount: 3000.01 })
  t('a payment bigger than the balance due is rejected', !r.ok && /balance/i.test(r.error), r)
  r = await post({ action: 'recordPayment', token: k, invoiceNo: 'CKD-9999', amount: 100 })
  t('an unknown bill is rejected', !r.ok && /not found/i.test(r.error), r)
  r = await post({ action: 'recordPayment', token: k, invoiceNo: 'CKD-0002', amount: 100 })
  t("an employee cannot record a payment on someone else's bill", !r.ok && /not found/i.test(r.error), r)
  r = await post({ action: 'recordPayment', token: k, invoiceNo: 'CKD-0001', amount: 100 })
  t('a bill already paid in full is rejected', !r.ok && /no balance/i.test(r.error), r)

  r = await post({ action: 'recordPayment', token: k, invoiceNo: partial.invoiceNo, amount: 1000, mode: 'Cash' })
  t('a part of the balance is recorded', r.ok && r.invoice.amountPaid === 3000 && r.invoice.balanceDue === 2000 && r.invoice.paymentStatus === 'Partially paid', r)
  t('the payment is logged with who took it', r.ok && r.invoice.payments.length === 1 && r.invoice.payments[0].amount === 1000 && r.invoice.payments[0].by === 'Kalpak Dorlikar', r.invoice)
  t('the bill keeps its own number, date and time', r.ok && r.invoice.invoiceNo === partial.invoiceNo && r.invoice.date === partial.date && r.invoice.time === partial.time, r.invoice)

  await clock('2026-10-29T18:30:00')
  r = await post({ action: 'recordPayment', token: k, invoiceNo: partial.invoiceNo, amount: 2000, mode: 'UPI' })
  t('paying the rest makes the bill Paid in full', r.ok && r.invoice.amountPaid === 5000 && r.invoice.balanceDue === 0 && r.invoice.paymentStatus === 'Paid in full', r)
  t('both later payments are kept, with their own date and mode', r.ok && r.invoice.payments.length === 2 && r.invoice.payments[1].mode === 'UPI' && r.invoice.payments[1].date === '2026-10-29' && r.invoice.payments[1].time === '18:30:00', r.invoice)
  r = await post({ action: 'recordPayment', token: k, invoiceNo: partial.invoiceNo, amount: 1 })
  t('nothing more can be recorded once it is paid in full', !r.ok, r)

  r = await post({ action: 'listInvoices', token: k })
  const after = r.invoices.find((inv) => inv.invoiceNo === partial.invoiceNo)
  t('the saved bill shows the new totals when listed again', after.amountPaid === 5000 && after.balanceDue === 0 && after.paymentStatus === 'Paid in full' && after.payments.length === 2, after)
  t('the rest of the saved bill is unchanged', after.total === 5000 && after.studentName === 'Partial Payer' && after.items.length === 1, after)

  // the owner can record a payment on an employee's bill
  r = await post({
    action: 'createInvoice', token: k,
    studentName: 'Owner Collects', phone: '2222222222',
    items: [{ name: 'DMIT (Test & Report Counselling)', price: 3500 }],
    discountMode: 'percent', discountPercent: 0,
    paymentMode: 'Cash', paymentStatus: 'Partially paid', amountPaid: 0,
  })
  t('a bill with nothing paid yet has the whole total due', r.ok && r.invoice.amountPaid === 0 && r.invoice.balanceDue === 3500, r)
  r = await post({ action: 'recordPayment', token: o, invoiceNo: r.invoice.invoiceNo, amount: 3500, mode: 'Card' })
  t("the owner can record a payment on an employee's bill", r.ok && r.invoice.balanceDue === 0 && r.invoice.payments[0].by === 'Bharat Rai', r)

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
