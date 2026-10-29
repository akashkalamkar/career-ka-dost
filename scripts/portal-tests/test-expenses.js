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
const relogin = async (u, pw) => (await post({ action: 'login', username: u, password: pw })).token
const sheetDump = () => fetch(B + '/__sheet').then((r) => r.json())
const driveDump = () => fetch(B + '/__drive').then((r) => r.json())
const evalGs = (code) => fetch(B + '/__eval?code=' + encodeURIComponent(code)).then((r) => r.json())

;(async () => {
  await clock('2026-10-29T12:00:00')
  let k = (await loginAs('kalpak', 'kalpak@123', 'KalpakNew2026')).token
  let o = (await loginAs('bharat', 'bharat@123', 'BharatNew2026')).token
  let m = (await loginAs('mallika', 'mallika@123', 'MallikaNew2026')).token

  // ---------------- expenses ----------------
  let r = await post({ action: 'listExpenses', token: k })
  t('an employee starts with no expenses', r.ok && r.expenses.length === 0 && r.myTotal === 0 && r.month === '2026-10', r)
  t("an employee's reply has no team totals at all", r.ok && !('people' in r) && !('total' in r) && r.isOwner === false, r)

  const base = { action: 'addExpense', token: k, date: '2026-10-28', category: 'Travel', description: 'Auto to school seminar', amount: 150.5 }
  r = await post({ ...base, category: '' }); t('a missing category is rejected', !r.ok, r)
  r = await post({ ...base, category: 'Party' }); t('an unknown category is rejected', !r.ok, r)
  r = await post({ ...base, description: '  ' }); t('a missing description is rejected', !r.ok, r)
  r = await post({ ...base, amount: 0 }); t('a zero amount is rejected', !r.ok, r)
  r = await post({ ...base, amount: -20 }); t('a negative amount is rejected', !r.ok, r)
  r = await post({ ...base, amount: 'abc' }); t('a non-number amount is rejected', !r.ok, r)
  r = await post({ ...base, amount: 100001 }); t('an amount over 1,00,000 is rejected', !r.ok, r)
  r = await post({ ...base, date: '2026-10-30' }); t('a future date is rejected', !r.ok && /future/i.test(r.error), r)
  r = await post({ ...base, date: '2026-02-31' }); t('an impossible date is rejected', !r.ok, r)
  r = await post({ ...base, date: '2026-07-01' }); t('an expense older than 3 months is rejected', !r.ok && /3 months/.test(r.error), r)

  r = await post(base); t('an expense is added', r.ok && r.expense.amount === 150.5 && r.expense.name === 'Kalpak Dorlikar', r)
  const kalpakFirst = r.expense.id
  r = await post({ ...base, category: 'Printing & stationery', description: 'Brochure printing', amount: 300 }); const kalpakSecond = r.expense.id
  r = await post({ action: 'addExpense', token: m, date: '2026-10-27', category: 'Food', description: 'Seminar snacks', amount: 500 })
  t('another employee adds an expense', r.ok, r)
  const mallikaId = r.expense.id
  r = await post({ action: 'addExpense', token: o, date: '2026-10-29', category: 'Other', description: 'Courier', amount: 100 })
  t('the owner can add an expense too', r.ok, r)

  r = await post({ action: 'listExpenses', token: k })
  t('an employee sees only their own expenses', r.ok && r.expenses.length === 2 && r.expenses.every((e) => e.username === 'kalpak'), r.expenses)
  t('an employee sees their own total', r.myTotal === 450.5, r)
  r = await post({ action: 'listExpenses', token: m })
  t('the other employee sees only theirs', r.ok && r.expenses.length === 1 && r.myTotal === 500, r)

  r = await post({ action: 'listExpenses', token: o })
  t('the owner sees every expense', r.ok && r.isOwner === true && r.expenses.length === 4, r.expenses)
  t('the owner sees the grand total', r.total === 1050.5, r)
  const kp = r.people.find((p) => p.username === 'kalpak')
  t('the owner sees a total per person', kp && kp.total === 450.5 && kp.count === 2 && r.people.find((p) => p.username === 'mallika').total === 500, r.people)

  r = await post({ action: 'deleteExpense', token: k, id: mallikaId })
  t("an employee cannot delete someone else's expense", !r.ok && /not found/i.test(r.error), r)
  r = await post({ action: 'deleteExpense', token: k, id: kalpakSecond })
  t('an employee deletes their own expense', r.ok && r.expenses.length === 1 && r.myTotal === 150.5, r)
  let sh = await sheetDump()
  t('a deleted expense stays in the sheet, marked Deleted', sh.Expenses.some((row) => row[0] === kalpakSecond && row[8] === 'Deleted'), sh.Expenses)
  t('an unpaid expense is marked Not paid yet in the sheet', sh.Expenses.some((row) => row[0] === kalpakFirst && row[8] === 'Not paid yet'), sh.Expenses)
  const rules = await evalGs("JSON.stringify(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Expenses').rules)").then(JSON.parse)
  t('the sheet colours Paid back rows green, Not paid yet red and Deleted grey',
    rules.some((x) => /Paid back/.test(x.formula) && x.background === '#d3f0d9') && rules.some((x) => /Not paid yet/.test(x.formula) && x.background === '#f8c9c9') && rules.some((x) => /Deleted/.test(x.formula) && x.background === '#eeeeee'), rules)
  r = await post({ action: 'deleteExpense', token: k, id: kalpakSecond })
  t('deleting it twice is refused', !r.ok, r)

  r = await post({ action: 'markExpensesPaidBack', token: k, username: 'kalpak', month: '2026-10' })
  t('an employee cannot mark expenses as paid back', !r.ok && /Bharat Rai/.test(r.error), r)
  r = await post({ action: 'markExpensesPaidBack', token: o, username: 'kalpak', month: '2026-10' })
  t("the owner marks one person's month as paid back", r.ok && r.paidCount === 1 && r.paidAmount === 150.5, r)
  t('paid-back entries leave the portal for the owner', !r.people.some((p) => p.username === 'kalpak') && !r.expenses.some((e) => e.username === 'kalpak'), r)
  t("other people's amounts are untouched", r.people.find((p) => p.username === 'mallika').total === 500 && r.total === 600, r)
  sh = await sheetDump()
  const paidRow = sh.Expenses.find((row) => row[0] === kalpakFirst)
  t('the paid-back entry stays in the sheet as Paid back, with date and who paid', paidRow && paidRow[8] === 'Paid back' && paidRow[9] && paidRow[10] === 'Bharat Rai', paidRow)
  r = await post({ action: 'markExpensesPaidBack', token: o, username: 'kalpak', month: '2026-10' })
  t('marking the same month again is refused', !r.ok && /Nothing/.test(r.error), r)
  r = await post({ action: 'deleteExpense', token: k, id: kalpakFirst })
  t('an expense already paid back cannot be deleted', !r.ok && /paid back/.test(r.error), r)
  r = await post({ action: 'listExpenses', token: k })
  t('paid-back entries leave the portal for the employee too', r.ok && r.expenses.length === 0 && r.myTotal === 0, r)

  r = await post({ action: 'addExpense', token: k, date: '2026-09-15', category: 'Food', description: 'Team lunch', amount: 80 })
  r = await post({ action: 'listExpenses', token: k, month: '2026-09' })
  t('expenses are listed by month', r.ok && r.expenses.length === 1 && r.myTotal === 80, r)
  r = await post({ action: 'listExpenses', token: o, month: '2026-10' })
  t("another month's expense is not counted", r.total === 600, r)
  r = await post({ action: 'listExpenses', token: k, month: '2026-13' })
  t('an impossible month is rejected', !r.ok, r)

  // ---------------- holidays ----------------
  r = await post({ action: 'listHolidays', token: k, year: '2026' })
  t('the three national holidays are there without entering anything', r.ok && r.national.map((h) => h.date).join() === '2026-01-26,2026-08-15,2026-10-02', r)
  t('an employee can view but not edit holidays', r.canEdit === false && r.custom.length === 0, r)
  r = await post({ action: 'addHoliday', token: k, date: '2026-11-09', name: 'Diwali' })
  t('an employee cannot add a holiday', !r.ok && /Bharat Rai/.test(r.error), r)
  r = await post({ action: 'addHoliday', token: o, date: '2026-11-01', name: 'Extra' })
  t('a Sunday is already a holiday', !r.ok && /Sunday/.test(r.error), r)
  r = await post({ action: 'addHoliday', token: o, date: '2026-10-02', name: 'Extra' })
  t('a national holiday is already a holiday', !r.ok && /Gandhi Jayanti/.test(r.error), r)
  r = await post({ action: 'addHoliday', token: o, date: '2026-11-31', name: 'Extra' })
  t('an impossible date is rejected', !r.ok, r)
  r = await post({ action: 'addHoliday', token: o, date: '2026-11-09', name: ' ' })
  t('a holiday needs a name', !r.ok, r)
  r = await post({ action: 'addHoliday', token: o, date: '2026-11-09', name: 'Diwali' })
  t('the owner adds a holiday', r.ok && r.canEdit === true && r.custom.length === 1 && r.custom[0].name === 'Diwali' && r.custom[0].addedBy === 'Bharat Rai', r)
  r = await post({ action: 'addHoliday', token: o, date: '2026-11-09', name: 'Diwali again' })
  t('the same date cannot be added twice', !r.ok && /Diwali/.test(r.error), r)

  await clock('2026-11-09T10:00:00')
  k = await relogin('kalpak', 'KalpakNew2026')
  r = await post({ action: 'me', token: k })
  t("the portal knows today is the owner's holiday", r.ok && r.holidayToday === 'Diwali', r.holidayToday)
  t('the month holiday list has the 5 Sundays and Diwali', r.monthHolidays.length === 6 && r.monthHolidays.some((h) => h.date === '2026-11-09' && h.name === 'Diwali') && r.monthHolidays.filter((h) => h.name === 'Sunday').length === 5, r.monthHolidays)
  await clock('2026-11-08T10:00:00')
  k = await relogin('kalpak', 'KalpakNew2026')
  r = await post({ action: 'me', token: k }); t('a Sunday shows as a holiday', r.holidayToday === 'Sunday', r.holidayToday)
  r = await post({ action: 'checkin', token: k }); t('checking in on a holiday is still possible if someone works that day', r.ok && r.today.checkIn === '10:00:00', r)
  await clock('2026-11-10T10:00:00')
  k = await relogin('kalpak', 'KalpakNew2026')
  r = await post({ action: 'me', token: k }); t('an ordinary weekday is not a holiday', r.ok && r.holidayToday === null, r.holidayToday)

  o = await relogin('bharat', 'BharatNew2026')
  r = await post({ action: 'attendance', token: o, month: '2026-08' })
  t('another month lists its holidays too (15 Aug + Sundays)', r.ok && r.monthHolidays.some((h) => h.date === '2026-08-15' && h.name === 'Independence Day') && r.monthHolidays.filter((h) => h.name === 'Sunday').length === 5, r.monthHolidays)

  r = await post({ action: 'removeHoliday', token: k, date: '2026-11-09' })
  t('an employee cannot remove a holiday', !r.ok, r)
  r = await post({ action: 'removeHoliday', token: o, date: '2026-11-08' })
  t('a Sunday cannot be removed', !r.ok && /always/.test(r.error), r)
  r = await post({ action: 'removeHoliday', token: o, date: '2026-11-09' })
  t('the owner removes a holiday he added', r.ok && r.custom.length === 0, r)
  sh = await sheetDump()
  t('a removed holiday stays in the sheet, marked Removed', sh.Holidays.some((row) => row[0] === '2026-11-09' && row[4] === 'Removed'), sh.Holidays)
  r = await post({ action: 'removeHoliday', token: o, date: '2026-11-09' })
  t('removing it again is refused', !r.ok && /not found/i.test(r.error), r)
  r = await post({ action: 'addHoliday', token: o, date: '2026-11-09', name: 'Diwali' })
  t('a removed holiday can be added again', r.ok && r.custom.length === 1, r)

  // ---------------- backup ----------------
  await evalGs('backupNow()')
  let d = await driveDump()
  const folder = d.folders.find((f) => f.name === 'Career Ka Dost - Staff Portal Backups')
  t('a backup folder is created in Drive', d.folders.length === 1 && folder, d)
  t('the backup is a copy of the whole sheet, every tab', folder.files.length === 1 && ['Staff', 'Attendance', 'Expenses', 'Holidays'].every((tab) => folder.files[0].tabs.includes(tab)), folder.files)
  await evalGs('installBackupTrigger()')
  await evalGs('installBackupTrigger()')
  d = await driveDump()
  t('installing the weekly backup twice still leaves exactly one trigger', d.triggers.filter((x) => x.fn === 'backupNow').length === 1 && d.triggers[0].day === 'SUNDAY', d.triggers)
  t('the folder is reused, not created again', d.folders.length === 1 && d.folders[0].files.length === 3, d.folders)
  for (let i = 0; i < 30; i++) await evalGs('backupNow()')
  d = await driveDump()
  t('only the newest 26 backups are kept', d.folders[0].files.filter((f) => !f.trashed).length === 26, d.folders[0].files.length)

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
