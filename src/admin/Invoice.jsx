import { useEffect, useRef, useState } from 'react'
import { btnInk, btnPrimary } from '../config/ui'
import { INVOICE, PAYMENT_MODES, SERVICES } from '../config/billing'
import { SITE } from '../config/site'
import { amountInWords } from '../utils/numberWords'
import { card, inputClass } from './format'
import { Message } from './Shared'
import { useCaller } from './useCaller'

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100
const money = (n) => `Rs ${round2(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ---------------------------------------------------------------------------------------------
// Adding services to the bill
// ---------------------------------------------------------------------------------------------

function ServicePicker({ onAdd }) {
  const [serviceId, setServiceId] = useState(SERVICES[0] ? SERVICES[0].id : 'custom')
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')

  function add() {
    if (serviceId === 'custom') {
      const name = customName.trim()
      const price = Number(customPrice)
      if (!name || !isFinite(price) || price < 0) return
      onAdd({ name, price: round2(price) })
      setCustomName('')
      setCustomPrice('')
      return
    }
    const svc = SERVICES.find((s) => s.id === serviceId)
    if (!svc) return
    onAdd({ name: svc.name, price: svc.price })
  }

  return (
    // A plain div, not a form: this sits inside the bigger "Generate bill" form, and a form cannot
    // contain another form (the browser silently mishandles it), so "+ Add to bill" is a button
    // with its own onClick instead of a nested submit.
    <div className="flex flex-wrap items-end gap-3 border border-dashed border-ink/25 p-4">
      <label className="block text-sm font-bold">
        Service
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={`${inputClass} sm:w-72`}>
          {SERVICES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} - Rs {s.price.toLocaleString('en-IN')}
            </option>
          ))}
          <option value="custom">Custom service...</option>
        </select>
      </label>
      {serviceId === 'custom' ? (
        <>
          <label className="block text-sm font-bold">
            Service name
            <input value={customName} onChange={(e) => setCustomName(e.target.value)} className={`${inputClass} sm:w-56`} placeholder="e.g. Resume review" />
          </label>
          <label className="block text-sm font-bold">
            Price (Rs)
            <input type="number" min="0" step="0.01" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className={`${inputClass} sm:w-32`} />
          </label>
        </>
      ) : null}
      <button type="button" onClick={add} className={`${btnInk} !px-5 !py-2.5`}>
        + Add to bill
      </button>
    </div>
  )
}

function ItemsTable({ items, onRemove }) {
  if (!items.length) {
    return <p className="border border-dashed border-ink/25 px-4 py-6 text-center font-semibold text-mute">No services added yet. Pick one above.</p>
  }
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[24rem] text-left text-sm">
        <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((it, i) => (
            <tr key={i}>
              <td className="px-4 py-3 font-semibold">{it.name}</td>
              <td className="whitespace-nowrap px-4 py-3">{money(it.price)}</td>
              <td className="px-4 py-3 text-right">
                <button type="button" onClick={() => onRemove(i)} className="text-xs font-extrabold text-[#a40000] underline underline-offset-4">
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// The printable invoice itself
// ---------------------------------------------------------------------------------------------

// `ref` as a plain prop (React 19) - it must land on this component's own root div, the one with the
// A4 sizing classes, not on some wrapper around it, or a PDF capture of it comes out the wrapper's
// (wider, unconstrained) width instead and the receipt ends up short and squashed into the top of the page.
export function PrintableInvoice({ invoice, ref }) {
  return (
    // A4 is 297mm tall; this targets noticeably less (280mm) so small rendering differences (fonts,
    // antialiasing, the border, and - seen in testing - the off-screen hidden render used to re-download
    // a past bill measuring a few mm taller than the normal on-screen one) never push the captured image
    // past a full page and spill the signature onto an unwanted, mostly-blank second page. The footer is
    // pushed to the bottom via mt-auto below, so the receipt still reads as filling the whole printed page.
    <div ref={ref} className="print-area mx-auto flex min-h-[280mm] max-w-[210mm] flex-col border border-line bg-white p-12 text-ink shadow-sm print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-brand pb-8">
        <div className="flex items-center gap-5">
          <img src={SITE.logoUrl} alt="" className="h-20 w-20 object-contain" />
          <div>
            <p className="font-display text-3xl font-extrabold">{SITE.name}</p>
            <p className="text-sm font-semibold text-mute">{SITE.tagline}</p>
            <p className="mt-2 max-w-xs text-sm text-ink-soft">{SITE.addressLine}</p>
            <p className="text-sm text-ink-soft">
              {SITE.phoneDisplay} &middot; {SITE.email}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold uppercase tracking-wide">Receipt</p>
          <p className="mt-2 text-lg font-bold">{invoice.invoiceNo}</p>
          <p className="text-sm text-ink-soft">{invoice.date}</p>
          <p className="text-sm text-ink-soft">{invoice.time}</p>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-mute">Billed to</p>
          <p className="mt-2 text-xl font-bold">{invoice.studentName}</p>
          <p className="mt-1 text-base text-ink-soft">{invoice.phone}</p>
          {invoice.classOrCourse ? <p className="text-base text-ink-soft">{invoice.classOrCourse}</p> : null}
          {invoice.city ? <p className="text-base text-ink-soft">{invoice.city}</p> : null}
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-extrabold uppercase tracking-wider text-mute">Received by</p>
          <p className="mt-2 text-xl font-bold">{invoice.createdByName}</p>
        </div>
      </div>

      <table className="mt-16 w-full text-left">
        <thead className="border-b-2 border-ink/15 text-sm font-extrabold uppercase tracking-wider">
          <tr>
            <th className="py-4">Service</th>
            <th className="py-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line text-base">
          {invoice.items.map((it, i) => (
            <tr key={i}>
              <td className="py-4">{it.name}</td>
              <td className="py-4 text-right">{money(it.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 ml-auto w-full max-w-sm space-y-3 text-base">
        <div className="flex justify-between">
          <span className="text-ink-soft">Subtotal</span>
          <span className="font-semibold">{money(invoice.subtotal)}</span>
        </div>
        {invoice.discountAmount > 0 ? (
          <div className="flex justify-between">
            <span className="text-ink-soft">Discount ({round2(invoice.discountPercent)}%)</span>
            <span className="font-semibold">- {money(invoice.discountAmount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t-2 border-ink/20 pt-3 text-2xl font-extrabold">
          <span>Total</span>
          <span>{money(invoice.total)}</span>
        </div>
        {invoice.paymentStatus === 'Partially paid' ? (
          <>
            <div className="flex justify-between">
              <span className="text-ink-soft">Amount paid</span>
              <span className="font-semibold">{money(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-[#a40000]">
              <span>Balance due</span>
              <span>{money(invoice.balanceDue)}</span>
            </div>
          </>
        ) : null}
      </div>

      <p className="mt-10 text-lg font-semibold italic">{amountInWords(invoice.total)}</p>

      <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2 text-base">
        <p>
          <span className="font-bold">Payment mode:</span> {invoice.paymentMode}
        </p>
        <p>
          <span className="font-bold">Status:</span> {invoice.paymentStatus}
        </p>
      </div>

      {invoice.notes ? <p className="mt-6 text-base text-ink-soft">Note: {invoice.notes}</p> : null}

      {/* mt-auto: whatever room is left on the page (there is always some, a bill is short) collects
          here, so this block sits at the bottom of the page rather than right under the note above. */}
      <div className="mt-auto flex items-end justify-between gap-6 border-t border-line pt-10">
        <p className="max-w-xs text-sm text-mute">{INVOICE.footerNote}</p>
        <div className="text-center">
          <img src={INVOICE.signatureUrl} alt="" className="mx-auto h-20 object-contain" />
          <p className="mt-2 border-t border-ink/30 pt-2 text-base font-bold">{INVOICE.signatureName}</p>
          <p className="text-sm text-mute">{INVOICE.signatureRole}</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Generate bill (everyone: owner and staff alike)
// ---------------------------------------------------------------------------------------------

export function GenerateBill({ token, onAuthError }) {
  const run = useCaller(token, onAuthError)

  const [studentName, setStudentName] = useState('')
  const [phone, setPhone] = useState('')
  const [classOrCourse, setClassOrCourse] = useState('')
  const [city, setCity] = useState('')
  const [items, setItems] = useState([])

  const [discountMode, setDiscountMode] = useState('percent')
  const [discountPercentInput, setDiscountPercentInput] = useState('0')
  const [discountAmountInput, setDiscountAmountInput] = useState('0')

  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0])
  const [paymentStatus, setPaymentStatus] = useState('Paid in full')
  const [amountPaidInput, setAmountPaidInput] = useState('')
  const [notes, setNotes] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [invoice, setInvoice] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const invoiceRef = useRef(null)

  const subtotal = round2(items.reduce((sum, it) => sum + it.price, 0))
  const discountPercent = discountMode === 'percent' ? Number(discountPercentInput) || 0 : subtotal > 0 ? round2(((Number(discountAmountInput) || 0) / subtotal) * 100) : 0
  const discountAmount = discountMode === 'amount' ? Math.min(Number(discountAmountInput) || 0, subtotal) : round2((subtotal * discountPercent) / 100)
  const total = round2(subtotal - discountAmount)
  const balanceDue = paymentStatus === 'Partially paid' ? round2(total - (Number(amountPaidInput) || 0)) : 0

  function addItem(it) {
    setItems((list) => [...list, it])
  }
  function removeItem(i) {
    setItems((list) => list.filter((_, idx) => idx !== i))
  }

  function reset() {
    setStudentName('')
    setPhone('')
    setClassOrCourse('')
    setCity('')
    setItems([])
    setDiscountMode('percent')
    setDiscountPercentInput('0')
    setDiscountAmountInput('0')
    setPaymentMode(PAYMENT_MODES[0])
    setPaymentStatus('Paid in full')
    setAmountPaidInput('')
    setNotes('')
    setInvoice(null)
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!items.length) {
      setError('Please add at least one service.')
      return
    }
    setBusy(true)
    try {
      const data = await run('createInvoice', {
        studentName,
        phone,
        classOrCourse,
        city,
        items: items.map((it) => ({ name: it.name, price: it.price })),
        discountMode,
        discountPercent,
        discountAmount,
        paymentMode,
        paymentStatus,
        amountPaid: paymentStatus === 'Partially paid' ? Number(amountPaidInput) || 0 : undefined,
        notes,
      })
      setInvoice(data.invoice)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function downloadPdf() {
    if (!invoiceRef.current) return
    setDownloading(true)
    try {
      // Loaded only now, not on every page view: jsPDF + html2canvas are only needed by staff
      // generating a bill, not by every visitor to the public website.
      const { downloadInvoicePdf } = await import('../utils/downloadInvoicePdf')
      await downloadInvoicePdf(invoiceRef.current, `${invoice.invoiceNo}.pdf`)
    } catch {
      setError('Could not create the PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (invoice) {
    return (
      <div className="space-y-5">
        <div className={`${card} print:hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold">Bill ready: {invoice.invoiceNo}</h2>
              <p className="mt-1 text-ink-soft">Check it below, then download it as a PDF (A4 size, ready to print).</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={downloadPdf} disabled={downloading} className={`${btnPrimary} !px-5 !py-2.5 disabled:opacity-50`}>
                {downloading ? 'Preparing PDF...' : 'Download PDF'}
              </button>
              <button type="button" onClick={reset} className={`${btnInk} !px-5 !py-2.5`}>
                Create another bill
              </button>
            </div>
          </div>
        </div>
        <PrintableInvoice ref={invoiceRef} invoice={invoice} />
      </div>
    )
  }

  return (
    <div className={card}>
      <h2 className="font-display text-2xl font-extrabold md:text-3xl">Generate bill</h2>
      <p className="mt-2 text-ink-soft">Pick the service(s), add a discount if needed, and print a receipt. The invoice number, date and time are filled in automatically.</p>

      <form onSubmit={submit} className="mt-6 space-y-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Student name
            <input required value={studentName} onChange={(e) => setStudentName(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold">
            Phone number
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold">
            Class / course <span className="font-normal text-mute">(optional)</span>
            <input value={classOrCourse} onChange={(e) => setClassOrCourse(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold">
            City <span className="font-normal text-mute">(optional)</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </label>
        </div>

        <div>
          <h3 className="font-display text-lg font-extrabold">Services</h3>
          <div className="mt-3 space-y-3">
            <ServicePicker onAdd={addItem} />
            <ItemsTable items={items} onRemove={removeItem} />
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg font-extrabold">Discount</h3>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <label className="block text-sm font-bold">
              Discount %
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountMode === 'percent' ? discountPercentInput : discountPercent.toFixed(2)}
                onChange={(e) => {
                  setDiscountMode('percent')
                  setDiscountPercentInput(e.target.value)
                }}
                className={`${inputClass} sm:w-32`}
              />
            </label>
            <span className="pb-3 font-bold text-mute">or</span>
            <label className="block text-sm font-bold">
              Discount Rs
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountMode === 'amount' ? discountAmountInput : discountAmount.toFixed(2)}
                onChange={(e) => {
                  setDiscountMode('amount')
                  setDiscountAmountInput(e.target.value)
                }}
                className={`${inputClass} sm:w-32`}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-lg font-extrabold">Payment</h3>
            <div className="mt-3 space-y-3">
              <label className="block text-sm font-bold">
                Mode
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className={`${inputClass} sm:w-56`}>
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="radio" name="paymentStatus" checked={paymentStatus === 'Paid in full'} onChange={() => setPaymentStatus('Paid in full')} className="h-4 w-4 accent-[#ffb81c]" />
                  Paid in full
                </label>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="radio" name="paymentStatus" checked={paymentStatus === 'Partially paid'} onChange={() => setPaymentStatus('Partially paid')} className="h-4 w-4 accent-[#ffb81c]" />
                  Partially paid
                </label>
              </div>
              {paymentStatus === 'Partially paid' ? (
                <label className="block text-sm font-bold">
                  Amount paid now (Rs)
                  <input type="number" min="0" step="0.01" value={amountPaidInput} onChange={(e) => setAmountPaidInput(e.target.value)} className={`${inputClass} sm:w-40`} />
                </label>
              ) : null}
            </div>
          </div>

          <div className="border border-line bg-paper-2 p-5">
            <h3 className="font-display text-lg font-extrabold">Summary</h3>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-semibold">{money(subtotal)}</span>
              </div>
              {discountAmount > 0 ? (
                <div className="flex justify-between">
                  <span className="text-ink-soft">Discount</span>
                  <span className="font-semibold">- {money(discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t-2 border-ink/20 pt-1.5 text-base font-extrabold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              {paymentStatus === 'Partially paid' ? (
                <div className="flex justify-between font-extrabold text-[#a40000]">
                  <span>Balance due</span>
                  <span>{money(balanceDue)}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <label className="block text-sm font-bold">
          Note <span className="font-normal text-mute">(optional, printed on the bill)</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} !h-auto resize-y`} />
        </label>

        <Message>{error}</Message>

        <button type="submit" disabled={busy} className={`${btnPrimary} disabled:opacity-50`}>
          {busy ? 'Creating bill...' : 'Create bill'}
        </button>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Invoice log: the owner sees every bill, a staff member sees only the ones they made
// ---------------------------------------------------------------------------------------------

export function InvoiceLog({ token, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [downloadTarget, setDownloadTarget] = useState(null)
  const [downloadingNo, setDownloadingNo] = useState('')
  const hiddenRef = useRef(null)

  useEffect(() => {
    let alive = true
    run('listInvoices', {})
      .then((d) => {
        if (!alive) return
        setData(d)
        setError('')
      })
      .catch((err) => alive && setError(err.message))
    return () => {
      alive = false
    }
  }, [run])

  // Re-downloading a past bill (if the customer lost it): the row is rendered off-screen in exactly the
  // same layout as a fresh bill, using its original date and time, then turned into the same PDF.
  useEffect(() => {
    if (!downloadTarget) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const { downloadInvoicePdf } = await import('../utils/downloadInvoicePdf')
        if (!cancelled && hiddenRef.current) await downloadInvoicePdf(hiddenRef.current, `${downloadTarget.invoiceNo}.pdf`)
      } catch {
        if (!cancelled) setError('Could not create the PDF. Please try again.')
      } finally {
        if (!cancelled) {
          setDownloadTarget(null)
          setDownloadingNo('')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [downloadTarget])

  const loaded = Boolean(data) || Boolean(error)
  const rows = data ? data.invoices : []

  return (
    <div className={card}>
      <h2 className="font-display text-2xl font-extrabold md:text-3xl">{data && data.isOwner ? 'All invoices' : 'My invoices'}</h2>
      <p className="mt-2 text-ink-soft">{data && data.isOwner ? 'Every bill created by the whole team.' : 'Bills you have created yourself.'}</p>
      <div className="mt-5 space-y-4">
        <Message>{error}</Message>
        {!loaded ? <p className="font-semibold text-mute">Loading...</p> : null}
        {loaded && !rows.length ? <p className="border border-dashed border-ink/25 px-4 py-6 text-center font-semibold text-mute">No bills yet.</p> : null}
        {loaded && rows.length ? (
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[50rem] text-left text-sm">
              <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Services</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  {data.isOwner ? <th className="px-4 py-3">By</th> : null}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.invoiceNo}>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{r.invoiceNo}</td>
                    <td className="whitespace-nowrap px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3 font-semibold">{r.studentName}</td>
                    <td className="max-w-xs px-4 py-3 text-xs text-ink-soft">{r.services}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{money(r.total)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{r.paymentStatus}</td>
                    {data.isOwner ? <td className="whitespace-nowrap px-4 py-3">{r.createdByName}</td> : null}
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDownloadingNo(r.invoiceNo)
                          setDownloadTarget(r)
                        }}
                        disabled={downloadingNo === r.invoiceNo}
                        className="text-xs font-extrabold text-brass underline underline-offset-4 disabled:opacity-50"
                      >
                        {downloadingNo === r.invoiceNo ? 'Preparing...' : 'Download'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {/* An explicit width on the hidden box below matters: without one, this fixed, off-screen box
            shrinks to fit its content instead of giving the receipt (max-w-[210mm], centred) room to
            reach its full width, and everything inside renders narrower (and so, wrongly, taller once
            scaled to a PDF page) than the normal on-screen version. */}
        {downloadTarget ? (
          <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '1000px' }} aria-hidden>
            <PrintableInvoice ref={hiddenRef} invoice={downloadTarget} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
