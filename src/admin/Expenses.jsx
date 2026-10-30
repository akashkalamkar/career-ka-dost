import { useEffect, useState } from 'react'
import { btnPrimary } from '../config/ui'
import { card, dateLabel, inputClass } from './format'
import { Message } from './Shared'
import { useCaller } from './useCaller'

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100
const money = (n) => `Rs ${round2(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const CATEGORIES = ['Travel', 'Food', 'Printing & stationery', 'Office supplies', 'Phone & internet', 'Other']

function monthLabel(month) {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/** An older portal script answers "Unknown request." for the new actions: say what to do instead. */
const explain = (message) =>
  message === 'Unknown request.' ? 'Expenses need the new Google script (portal-v14). Paste it into Apps Script and deploy a New version.' : message

function AddExpense({ run, today, onAdded }) {
  const [date, setDate] = useState(today)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await run('addExpense', { date, category, description, amount: Number(amount) })
      setDescription('')
      setAmount('')
      setCategory('')
      onAdded(data.expense)
    } catch (err) {
      setError(explain(err.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className={card}>
      <h2 className="font-display text-2xl font-extrabold md:text-3xl">Add an expense</h2>
      <p className="mt-2 text-ink-soft">Money you spent for the office. Bharat Rai pays it back to you every month.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Date
          <input type="date" required value={date} max={today} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-bold">
          Category
          <select required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="">Choose...</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold sm:col-span-2">
          What was it for?
          <input type="text" required maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Auto fare to school seminar" className={inputClass} />
        </label>
        <label className="block text-sm font-bold">
          Amount (Rs)
          <input type="number" required min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </label>
      </div>
      <div className="mt-5 space-y-3">
        <Message>{error}</Message>
        <button type="submit" disabled={busy} className={`${btnPrimary} disabled:opacity-50`}>
          {busy ? 'Saving...' : 'Add expense'}
        </button>
      </div>
    </form>
  )
}

function ExpenseTable({ rows, showName, onDelete, deletingId }) {
  if (!rows.length) return <p className="border border-dashed border-ink/25 px-4 py-6 text-center font-semibold text-mute">Nothing waiting to be paid back for this month.</p>
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Date</th>
            {showName ? <th className="px-4 py-3">Name</th> : null}
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">For</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap px-4 py-3">{dateLabel(e.date)}</td>
              {showName ? <td className="whitespace-nowrap px-4 py-3 font-semibold">{e.name}</td> : null}
              <td className="whitespace-nowrap px-4 py-3">{e.category}</td>
              <td className="px-4 py-3">{e.description}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold">{money(e.amount)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <button type="button" disabled={deletingId === e.id} onClick={() => onDelete(e)} className="text-xs font-extrabold text-[#a40000] underline underline-offset-4 disabled:opacity-50">
                  {deletingId === e.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Owner only: what each person is owed for the month, and the button to mark it paid back. */
function PeopleSummary({ data, onPay, payingUser }) {
  if (!data.people.length) return null
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="bg-paper-2 text-xs font-extrabold uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Entries</th>
            <th className="px-4 py-3">To pay back</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.people.map((p) => (
            <tr key={p.username}>
              <td className="px-4 py-3 font-semibold">{p.name}</td>
              <td className="px-4 py-3">{p.count}</td>
              <td className="px-4 py-3 font-extrabold text-[#a40000]">{money(p.total)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <button type="button" disabled={Boolean(payingUser)} onClick={() => onPay(p)} className="border-2 border-[#0f6b2a] bg-[#e5f6e9] px-3 py-1.5 text-xs font-extrabold text-[#0b4f1f] transition hover:bg-[#c9eed3] disabled:opacity-50">
                  {payingUser === p.username ? 'Saving...' : 'Paid back'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-line bg-paper-2 font-extrabold">
          <tr>
            <td className="px-4 py-3">Everyone</td>
            <td className="px-4 py-3">{data.expenses.length}</td>
            <td className="px-4 py-3">{money(data.total)}</td>
            <td className="px-4 py-3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/**
 * Staff expenses. Everyone adds their own. A staff member sees only their own entries and total; the
 * owner sees everyone's, the total per person and overall, and marks a person's month as paid back.
 */
export function Expenses({ token, boot, onAuthError }) {
  const run = useCaller(token, onAuthError)
  const today = boot.serverTime.date
  const [month, setMonth] = useState(boot.month)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [who, setWho] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [payingUser, setPayingUser] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!month) return undefined
    let alive = true
    run('listExpenses', { month })
      .then((d) => {
        if (!alive) return
        setData(d)
        setError('')
      })
      .catch((err) => alive && setError(explain(err.message)))
    return () => {
      alive = false
    }
  }, [run, month, reload])

  function onAdded(expense) {
    setNotice(`Added ${money(expense.amount)} for ${expense.description}.`)
    if (expense.date.slice(0, 7) === month) setReload((n) => n + 1)
    else setMonth(expense.date.slice(0, 7))
  }

  async function onDelete(e) {
    if (!window.confirm(`Delete this expense of ${money(e.amount)} (${e.description})?`)) return
    setDeletingId(e.id)
    setNotice('')
    try {
      setData(await run('deleteExpense', { id: e.id }))
      setError('')
    } catch (err) {
      setError(explain(err.message))
    } finally {
      setDeletingId('')
    }
  }

  async function onPay(p) {
    if (!window.confirm(`Have you given ${money(p.total)} to ${p.name} for ${monthLabel(month)}? Their entries will be removed from the portal and kept in the Google Sheet as Paid back.`)) return
    setPayingUser(p.username)
    setNotice('')
    try {
      const d = await run('markExpensesPaidBack', { username: p.username, month })
      setData(d)
      setError('')
      setNotice(`Paid back ${money(d.paidAmount)} to ${p.name} for ${monthLabel(month)}. Their entries are now saved in the Google Sheet (Expenses tab) as Paid back.`)
    } catch (err) {
      setError(explain(err.message))
    } finally {
      setPayingUser('')
    }
  }

  // Only show a reply that belongs to the month now selected (never a slower, older one).
  const shown = data && data.month === month ? data : null
  const isOwner = shown ? shown.isOwner : boot.user.role === 'owner'
  const rows = shown ? (who ? shown.expenses.filter((e) => e.username === who) : shown.expenses) : []

  return (
    <div className="space-y-8">
      <AddExpense run={run} today={today} onAdded={onAdded} />

      <div className={card}>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">{isOwner ? 'Team expenses' : 'My expenses'}</h2>
        <p className="mt-2 text-ink-soft">
          {isOwner
            ? 'Money each person has spent and not yet been paid back for. After you give them the money, click Paid back: their entries leave the portal and stay in the Google Sheet (Expenses tab) in green.'
            : 'Your expenses still to be paid back. Only you and Bharat Rai can see them. Once he pays you back, they leave this list.'}
        </p>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block text-sm font-bold">
            Month
            <input type="month" value={month} max={today.slice(0, 7)} onChange={(e) => setMonth(e.target.value)} className={`${inputClass} !mt-1 sm:w-48`} />
          </label>
          {isOwner && shown ? (
            <label className="block text-sm font-bold">
              Person
              <select value={who} onChange={(e) => setWho(e.target.value)} className={`${inputClass} !mt-1 sm:w-64`}>
                <option value="">Everyone</option>
                {shown.people.map((p) => (
                  <option key={p.username} value={p.username}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="mt-5 space-y-4">
          <Message>{error}</Message>
          <Message kind="ok">{notice}</Message>
          {!shown && !error ? <p className="font-semibold text-mute">Loading...</p> : null}
          {shown && isOwner ? <PeopleSummary data={shown} onPay={onPay} payingUser={payingUser} /> : null}
          {shown && !isOwner ? (
            <p className="text-lg font-extrabold">
              To be paid back to you for {monthLabel(month)}: {money(shown.myTotal)}
            </p>
          ) : null}
          {shown ? <ExpenseTable rows={rows} showName={isOwner} onDelete={onDelete} deletingId={deletingId} /> : null}
        </div>
      </div>
    </div>
  )
}
