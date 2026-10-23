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

;(async () => {
  console.log(JSON.stringify(await (await fetch(B)).json()))
  await clock('2026-10-19T09:00:00')
  // login
  let r = await post({ action: 'login', username: 'kalpak', password: 'wrong' }); t('wrong password rejected', !r.ok, r)
  r = await post({ action: 'login', username: 'nobody', password: 'x' }); t('unknown user rejected', !r.ok, r)
  r = await post({ action: 'login', username: 'Kalpak', password: 'kalpak@123' }); t('login ok (case-insensitive username)', r.ok && r.user.mustChange === true && r.user.role === 'employee', r)
  const kt = r.token
  r = await post({ action: 'checkin', token: kt }); t('must change password before anything else', !r.ok && /own password/i.test(r.error), r)
  r = await post({ action: 'changePassword', token: kt, current: 'kalpak@123', next: 'short' }); t('weak password rejected', !r.ok, r)
  r = await post({ action: 'changePassword', token: kt, current: 'nope', next: 'Newpass123' }); t('change needs current password', !r.ok, r)
  r = await post({ action: 'changePassword', token: kt, current: 'kalpak@123', next: 'kalpak@123' }); t('same password rejected', !r.ok, r)
  r = await post({ action: 'changePassword', token: kt, current: 'kalpak@123', next: 'Kalpak2026x' }); t('password changed', r.ok, r)
  r = await post({ action: 'login', username: 'kalpak', password: 'kalpak@123' }); t('old password no longer works', !r.ok, r)
  r = await post({ action: 'login', username: 'kalpak', password: 'Kalpak2026x' }); t('new password works, no forced change', r.ok && r.user.mustChange === false, r)
  const k = r.token

  // check-in times: 10:09:59 green, 10:10:00 red
  await clock('2026-10-19T10:09:59')
  r = await post({ action: 'checkin', token: k }); t('10:09:59 is On time (green)', r.ok && r.today.status === 'On time' && r.today.checkIn === '10:09:59', r)
  r = await post({ action: 'checkin', token: k }); t('cannot check in twice', !r.ok, r)
  await clock('2026-10-19T17:41:30')
  r = await post({ action: 'checkout', token: k }); t('checkout stores time and hours', r.ok && r.today.checkOut === '17:41:30' && r.today.hours === '7h 32m', r)
  r = await post({ action: 'checkout', token: k }); t('cannot check out twice', !r.ok, r)

  // another employee, exactly 10:10:00 -> Late
  await clock('2026-10-19T10:10:00')
  r = await post({ action: 'login', username: 'mallika', password: 'mallika@123' }); const mt = r.token
  await post({ action: 'changePassword', token: mt, current: 'mallika@123', next: 'Mallika2026x' })
  r = await post({ action: 'login', username: 'mallika', password: 'Mallika2026x' }); const m = r.token
  r = await post({ action: 'checkin', token: m }); t('10:10:00 is Late (red)', r.ok && r.today.status === 'Late', r)
  r = await post({ action: 'checkout', token: m }); t('checkout same minute works', r.ok, r)

  // next day: checkout without check-in
  await clock('2026-10-20T09:00:00')
  r = await post({ action: 'login', username: 'kalpak', password: 'Kalpak2026x' }); const k2 = r.token
  r = await post({ action: 'checkout', token: k2 }); t('checkout needs a check-in that day', !r.ok, r)

  // privacy: employee sees only own records, no owner actions
  await clock('2026-10-19T18:00:00')
  r = await post({ action: 'attendance', token: k2, month: '2026-10' }); t('employee sees only own rows', r.ok && r.rows.length === 1 && r.rows.every((x) => x.username === 'kalpak'), r)
  r = await post({ action: 'attendance', token: k2, month: '2026-10', username: 'mallika' }); t('employee cannot ask for others', r.ok && r.rows.every((x) => x.username === 'kalpak'), r)
  r = await post({ action: 'me', token: k2 }); t('employee gets no team list', r.ok && r.staff === undefined && r.rows.every((x) => x.username === 'kalpak'), r)
  r = await post({ action: 'resetPassword', token: k, username: 'mallika' }); t('employee cannot reset passwords', !r.ok, r)
  r = await post({ action: 'changePassword', token: k, current: 'Mallika2026x', next: 'Hacked12345' }); t('cannot change with someone elses password via own session', !r.ok, r)

  // owner
  r = await post({ action: 'login', username: 'bharat', password: 'bharat@123' }); const bt = r.token
  r = await post({ action: 'me', token: bt }); t('owner blocked until password changed', !r.ok, r)
  await post({ action: 'changePassword', token: bt, current: 'bharat@123', next: 'Bharat2026x' })
  r = await post({ action: 'login', username: 'bharat', password: 'Bharat2026x' }); const b = r.token
  r = await post({ action: 'me', token: b }); t('owner overview lists 5 staff', r.ok && r.staff.length === 5, r)
  const rec = (u) => r.staff.find((s) => s.username === u).today
  t('overview shows kalpak green + mallika red + others none', rec('kalpak')?.status === 'On time' && rec('mallika')?.status === 'Late' && rec('samiksha') === null, r.staff.map((s) => [s.username, s.today && s.today.status]))
  r = await post({ action: 'attendance', token: b, month: '2026-10' }); t('owner sees all rows', r.ok && r.rows.length === 2, r)
  r = await post({ action: 'attendance', token: b, month: '2026-10', username: 'mallika' }); t('owner can filter one person', r.ok && r.rows.length === 1, r)
  r = await post({ action: 'resetPassword', token: b, username: 'mallika' }); t('owner can reset (temp password returned)', r.ok && /^Ckd-/.test(r.tempPassword), r)
  const temp = r.tempPassword
  r = await post({ action: 'checkin', token: m }); t('reset logs the person out', !r.ok, r)
  r = await post({ action: 'login', username: 'mallika', password: 'Mallika2026x' }); t('old password dead after reset', !r.ok, r)
  r = await post({ action: 'login', username: 'mallika', password: temp }); t('temp password works and forces change', r.ok && r.user.mustChange === true, r)
  r = await post({ action: 'resetPassword', token: b, username: 'bharat' }); t('owner cannot reset himself here', !r.ok, r)

  // lockout
  for (let i = 0; i < 5; i++) await post({ action: 'login', username: 'nandini', password: 'bad' + i })
  r = await post({ action: 'login', username: 'nandini', password: 'nandini@123' }); t('5 wrong tries lock the account', !r.ok && /Too many/.test(r.error), r)

  // logout
  r = await post({ action: 'logout', token: b }); r = await post({ action: 'me', token: b }); t('logout kills the session', !r.ok, r)
  r = await post({ action: 'me', token: 'garbage' }); t('bad token rejected', !r.ok, r)

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
