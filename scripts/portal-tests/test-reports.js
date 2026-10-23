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
  await clock('2026-10-19T09:00:00')
  const kb = await loginAs('kalpak', 'kalpak@123', 'KalpakNew2026'); const k = kb.token
  const mb = await loginAs('mallika', 'mallika@123', 'MallikaNew2026'); const m = mb.token
  const ob = await loginAs('bharat', 'bharat@123', 'BharatNew2026'); const o = ob.token
  t('login carries myReport = null before anything is submitted', kb.myReport === null, kb)
  t('owner login carries no myReport field value (null, he never submits)', ob.myReport === null, ob)

  // submitting
  let r = await post({ action: 'submitReport', token: k, text: '  ' }); t('empty report rejected', !r.ok && /write/i.test(r.error), r)
  r = await post({ action: 'submitReport', token: k, text: 'x'.repeat(4001) }); t('too-long report rejected', !r.ok, r)
  r = await post({ action: 'submitReport', token: k, text: 'Called 5 leads, updated the Class 10 resources page.' })
  t('kalpak submits his report', r.ok && r.myReport && r.myReport.text === 'Called 5 leads, updated the Class 10 resources page.', r)
  r = await post({ action: 'me', token: k }); t('report comes back on a fresh me too', r.myReport.text === 'Called 5 leads, updated the Class 10 resources page.', r)

  // owner cannot submit
  r = await post({ action: 'submitReport', token: o, text: 'Reviewed everyone.' }); t('owner cannot submit a report', !r.ok && /owner/i.test(r.error), r)

  // updating the same day replaces it, does not add a second row
  r = await post({ action: 'submitReport', token: k, text: 'Updated: also called 3 more leads before leaving.' })
  t('resubmitting the same day updates, not duplicates', r.ok && r.myReport.text === 'Updated: also called 3 more leads before leaving.', r)

  // mallika submits too
  r = await post({ action: 'submitReport', token: m, text: 'Followed up on pending payments, no new leads today.' })
  t('mallika submits her own report', r.ok && r.myReport.text === 'Followed up on pending payments, no new leads today.', r)

  // owner sees both, by date, with names; nandini (no report yet) shows as not submitted
  r = await post({ action: 'teamReports', token: o, date: '2026-10-19' })
  t('owner sees reports for the date', r.ok && r.reports.length === 2, r)
  const byUser = Object.fromEntries(r.reports.map((x) => [x.username, x]))
  t('owner sees kalpak and mallika by name, date-stamped', byUser.kalpak && byUser.kalpak.name === 'Kalpak Dorlikar' && byUser.kalpak.date === '2026-10-19', byUser.kalpak)
  t('the staff roster lists everyone, including who has not submitted', r.staff.some((s) => s.username === 'nandini'), r.staff.map((s) => s.username))

  // an employee cannot see teamReports (owner only)
  r = await post({ action: 'teamReports', token: k, date: '2026-10-19' }); t('employee cannot see team reports', !r.ok && /owner/i.test(r.error), r)

  // bad date rejected
  r = await post({ action: 'teamReports', token: o, date: 'not-a-date' }); t('bad date rejected', !r.ok, r)

  // a new day: yesterday's report does not carry over, myReport resets to null
  await clock('2026-10-20T09:00:00')
  r = await post({ action: 'login', username: 'kalpak', password: 'KalpakNew2026' }); t('next day: no report yet', r.myReport === null, r)
  r = await post({ action: 'login', username: 'bharat', password: 'BharatNew2026' }); const o2 = r.token // the first owner session is 12h, so past a day's jump it has expired
  r = await post({ action: 'teamReports', token: o2, date: '2026-10-19' }); t('yesterday is still there when asked for by date', r.ok && r.reports.some((x) => x.username === 'kalpak'), r)
  r = await post({ action: 'teamReports', token: o2, date: '2026-10-20' }); t('today (the 20th) has nobody yet', r.ok && r.reports.length === 0, r)

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
