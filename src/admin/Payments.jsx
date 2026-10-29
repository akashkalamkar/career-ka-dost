import { useEffect, useState } from 'react'
import { PAYMENT_MODES } from '../config/billing'
import { SITE } from '../config/site'
import { whatsappLink, whatsappNumber } from '../utils/whatsapp'
import { card, dateLabel, inputClass } from './format'
import { Message } from './Shared'
import { useCaller } from './useCaller'

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100
const money = (n) => `Rs ${round2(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function daysSince(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number)
  if (!y || !m || !d) return null
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.round((today - Date.UTC(y, m - 1, d)) / 86400000))
}

function reminderText(inv) {
  return [
    'Namaste! This is a friendly reminder from Career Ka Dost.',
    '',
    `Student: ${inv.studentName}`,
    `Bill: ${inv.invoiceNo} (${dateLabel(inv.date)})`,
    `Total: ${money(inv.total)}`,
    `Paid: ${money(inv.amountPaid)}`,
    `Balance due: ${money(inv.balanceDue)}`,
    '',
    'You can pay by cash, UPI or card at our office, or reply here if you have any question.',
    'Thank you!',
    `Career Ka Dost, ${SITE.phoneDisplay}`,
  ].join('\n')
}

function RecordPaymentForm({ inv, run, onSaved, onCancel }) {
  const [amount, setAmount] = useState(String(round2(inv.balanceDue)))
  const [mode, setMode] = useState(PAYMENT_MODES[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setBusy(true)
    setError('')
    try {
      const data = await run('recordPayment', { invoiceNo: inv.invoiceNo, amount: Number(amount), mode })
      onSaved(data.invoice, round2(Number(amount)))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 space-y-3 border-l-4 border-brand bg-paper-2 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm font-bold">
          Amount received (Rs)
          <input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputClass} w-44`} />
        </label>
        <label className="block text-sm font-bold">
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value)} className={`${inputClass} w-44`}>
            {PAYMENT_MODES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={save} disabled={busy} className="h-12 border-2 border-brand-deep bg-brand px-5 text-sm font-extrabold disabled:opacity-50">
          {busy ? 'Saving...' : 'Save payment'}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className="h-12 border-2 border-ink/15 bg-white px-5 text-sm font-extrabold disabled:opacity-50">
          Cancel
        </button>
      </div>
      <Message>{error}</Message>
    </div>
  )
}

/**
 * Bills that still have money to collect, oldest first. A WhatsApp button opens a ready-made reminder to
 * the parent; "Record payment" saves money received later (the server checks it never exceeds the
 * balance), and a bill leaves this list once its balance reaches zero.
 */
export function PaymentsDue({ token, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [openNo, setOpenNo] = useState('')

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

  function onSaved(updated, amount) {
    setData((d) => ({ ...d, invoices: d.invoices.map((inv) => (inv.invoiceNo === updated.invoiceNo ? updated : inv)) }))
    setOpenNo('')
    setNotice(
      updated.balanceDue > 0
        ? `Saved ${money(amount)} for ${updated.invoiceNo}. Balance still due: ${money(updated.balanceDue)}.`
        : `Saved ${money(amount)} for ${updated.invoiceNo}. This bill is now paid in full.`,
    )
  }

  const due = data ? data.invoices.filter((inv) => inv.balanceDue > 0).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)) : []
  const totalDue = round2(due.reduce((sum, inv) => sum + inv.balanceDue, 0))

  return (
    <div className={card}>
      <h2 className="font-display text-2xl font-extrabold md:text-3xl">Payments due</h2>
      <p className="mt-2 text-ink-soft">
        {data && data.isOwner ? 'Every bill in the team that still has money to collect, oldest first.' : 'Your bills that still have money to collect, oldest first.'} Send a WhatsApp reminder, and record the money when it comes in.
      </p>
      <div className="mt-5 space-y-4">
        <Message>{error}</Message>
        <Message kind="ok">{notice}</Message>
        {!data && !error ? <p className="font-semibold text-mute">Loading...</p> : null}
        {data && !due.length ? <p className="border border-dashed border-ink/25 px-4 py-6 text-center font-semibold text-mute">Nothing pending. Every bill is paid in full.</p> : null}
        {due.length ? (
          <>
            <p className="text-lg font-extrabold">
              {due.length} {due.length === 1 ? 'bill' : 'bills'} pending, total {money(totalDue)}
            </p>
            <ul className="divide-y divide-line border border-line">
              {due.map((inv) => {
                const number = whatsappNumber(inv.phone)
                const days = daysSince(inv.date)
                return (
                  <li key={inv.invoiceNo} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold">
                          {inv.studentName} <span className="font-semibold text-mute">· {inv.invoiceNo}</span>
                        </p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {dateLabel(inv.date)}
                          {days !== null ? ` (${days === 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`})` : ''} · {inv.phone}
                          {data.isOwner ? ` · by ${inv.createdByName}` : ''}
                        </p>
                        <p className="mt-1 text-sm">
                          Total {money(inv.total)} · Paid {money(inv.amountPaid)} · <span className="font-extrabold text-[#a40000]">Due {money(inv.balanceDue)}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {number ? (
                          <a
                            href={whatsappLink(number, reminderText(inv))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-2 border-[#1d9b4f] bg-[#e5f6e9] px-4 py-2 text-sm font-extrabold text-[#0b4f1f] transition hover:bg-[#c9eed3]"
                          >
                            WhatsApp reminder
                          </a>
                        ) : (
                          <span className="px-1 py-2 text-xs font-bold text-[#7a0000]">Phone number looks wrong - check it before reminding</span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setNotice('')
                            setOpenNo(openNo === inv.invoiceNo ? '' : inv.invoiceNo)
                          }}
                          className="border-2 border-brand-deep bg-white px-4 py-2 text-sm font-extrabold transition hover:bg-brand"
                        >
                          Record payment
                        </button>
                      </div>
                    </div>
                    {openNo === inv.invoiceNo ? <RecordPaymentForm inv={inv} run={run} onSaved={onSaved} onCancel={() => setOpenNo('')} /> : null}
                  </li>
                )
              })}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  )
}
