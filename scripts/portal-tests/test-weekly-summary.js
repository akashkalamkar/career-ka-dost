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
const mail = async () => (await fetch(B + '/__mail')).json()
const evalIn = async (code) => (await fetch(B + '/__eval?code=' + encodeURIComponent(code))).json()
let pass = 0, bad = 0
const t = (name, cond, extra) => { cond ? pass++ : bad++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  ' + JSON.stringify(extra))) }

async function loginAs(u, first, next) {
  let r = await post({ action: 'login', username: u, password: first })
  await post({ action: 'changePassword', token: r.token, current: first, next })
  r = await post({ action: 'login', username: u, password: next })
  return r
}

;(async () => {
  // owner applies-and-accepts a leave for mallika on the 19th, done early so "today or later" passes
  await clock('2026-10-15T09:00:00')
  const mb0 = await loginAs('mallika', 'mallika@123', 'MallikaNew2026'); const m0 = mb0.token
  let r = await post({ action: 'applyLeave', token: m0, type: 'full', from: '2026-10-19', reason: 'Family function' })
  t('mallika applies for leave on the 19th', r.ok, r)
  const leaveId = r.applied.id
  const ob = await loginAs('bharat', 'bharat@123', 'BharatNew2026'); const o = ob.token
  r = await post({ action: 'decideLeave', token: o, id: leaveId, decision: 'Accepted' }); t('owner accepts it', r.ok, r)

  // day 1 (2026-10-18): kalpak on time, checks out, submits a report
  await clock('2026-10-18T09:30:00')
  const kb = await loginAs('kalpak', 'kalpak@123', 'KalpakNew2026'); const k = kb.token
  r = await post({ action: 'checkin', token: k }); t('kalpak on time day 1', r.ok && r.today.status === 'On time', r)
  await clock('2026-10-18T18:00:00')
  await post({ action: 'checkout', token: k })
  r = await post({ action: 'submitReport', token: k, text: 'Called 5 leads, updated resources page.' })
  t('kalpak submits report day 1', r.ok, r)

  // day 3 (2026-10-20): kalpak late
  await clock('2026-10-20T10:30:00')
  r = await post({ action: 'login', username: 'kalpak', password: 'KalpakNew2026' })
  r = await post({ action: 'checkin', token: r.token }); t('kalpak late day 3', r.ok && r.today.status === 'Late', r)

  // day 4 (2026-10-21): mallika on time, no report
  await clock('2026-10-21T09:00:00')
  r = await post({ action: 'login', username: 'mallika', password: 'MallikaNew2026' })
  r = await post({ action: 'checkin', token: r.token }); t('mallika on time day 4', r.ok && r.today.status === 'On time', r)

  // something 8 days before the window, must not be included
  await clock('2026-10-10T09:00:00')
  r = await post({ action: 'login', username: 'kalpak', password: 'KalpakNew2026' })
  await post({ action: 'checkin', token: r.token })

  // "today" (2026-10-24): generate and send the summary
  await clock('2026-10-24T11:59:00')
  const text = await evalIn('weeklySummaryText()')
  t('summary covers the right 7-day range', text.indexOf('2026-10-18 to 2026-10-24') !== -1, text)
  t('kalpak: 2 present, 1 on time, 1 late', /Present: 2 day\(s\) - 1 on time, 1 late/.test(text), text)
  t('kalpak: 1 of 7 reports, with the text', text.indexOf('Daily reports: 1 of 7 days') !== -1 && text.indexOf('Called 5 leads, updated resources page.') !== -1, text)
  t('mallika: 1 present, 1 leave day, 0 reports', /Present: 1 day\(s\) - 1 on time, 0 late/.test(text) && /Leave: 1 day\(s\)/.test(text) && text.indexOf('Daily reports: 0 of 7 days') !== -1, text)
  t('the day-10 check-in (8 days back) is not counted', text.indexOf('Present: 3') === -1, text)
  t('the owner is not listed', text.indexOf('Bharat Rai') === -1, text)

  await evalIn('sendWeeklySummary()')
  const box = await mail()
  const msg = box[box.length - 1]
  t('an email is actually sent, to the company address', msg.to === 'careerkadost@gmail.com', msg)
  t('the subject names the date range', msg.subject.indexOf('2026-10-18 to 2026-10-24') !== -1, msg.subject)
  t('the body is the same summary text', msg.body === text, msg.body)

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
