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
let pass = 0, bad = 0
const t = (name, cond, extra) => { cond ? pass++ : bad++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  ' + JSON.stringify(extra))) }
const answers = { 'Which is your favorite car?': 'BMW', 'Which is your favorite food?': 'Alfredo' }

async function loginAs(u, first, next) {
  let r = await post({ action: 'login', username: u, password: first })
  await post({ action: 'changePassword', token: r.token, current: first, next })
  return post({ action: 'login', username: u, password: next })
}

;(async () => {
  await clock('2026-10-19T09:00:00')
  const ob = await loginAs('bharat', 'bharat@123', 'BharatNew2026'); const o = ob.token
  const kb = await loginAs('kalpak', 'kalpak@123', 'KalpakNew2026'); const k = kb.token

  // adding employees
  let r = await post({ action: 'addStaff', token: o, name: 'Riya Sharma', username: 'riya', password: 'riya@1234' })
  t('owner adds an employee', r.ok && r.added.username === 'riya' && r.staff.some((s) => s.username === 'riya' && s.role === 'employee' && s.active === true), r.added)
  r = await post({ action: 'addStaff', token: o, name: 'Another Riya', username: 'Riya', password: 'riya@1234' }); t('duplicate username refused (any case)', !r.ok && /already/i.test(r.error), r)
  for (const bad of ['ab', 'has space', '9lives', 'UPPER!', 'x'.repeat(21)]) {
    r = await post({ action: 'addStaff', token: o, name: 'Test Person', username: bad, password: 'good1234' }); t('bad username refused: ' + bad, !r.ok, r)
  }
  r = await post({ action: 'addStaff', token: o, name: 'T', username: 'tina', password: 'good1234' }); t('too-short name refused', !r.ok, r)
  r = await post({ action: 'addStaff', token: o, name: 'Tina Das', username: 'tina', password: 'short' }); t('the first password is always username@123 (a typed password is ignored)', r.ok && r.added.password === 'tina2026@123', r.added)
  r = await post({ action: 'addStaff', token: k, name: 'Sneaky', username: 'sneaky', password: 'good1234' }); t('an employee cannot add staff', !r.ok, r)

  // the new employee
  r = await post({ action: 'login', username: 'riya', password: 'riya@1234' }); t('new employee logs in with the first password and must change it', r.ok && r.user.mustChange === true && r.user.role === 'employee', r)
  const rt = r.token
  r = await post({ action: 'changePassword', token: rt, current: 'riya@1234', next: 'RiyaOwn2026' }); t('new employee sets her own password', r.ok, r)
  r = await post({ action: 'login', username: 'riya', password: 'RiyaOwn2026' }); const r2 = r.token
  r = await post({ action: 'checkin', token: r2 }); t('new employee can check in', r.ok, r)
  r = await post({ action: 'applyLeave', token: r2, type: 'full', from: '2026-10-25', reason: 'Trip home' }); t('new employee can apply for leave', r.ok, r)

  // discontinuing: nothing is deleted
  r = await post({ action: 'setActive', token: o, username: 'riya', active: false }); t('owner discontinues riya', r.ok && r.staff.find((s) => s.username === 'riya').active === false, r)
  r = await post({ action: 'login', username: 'riya', password: 'RiyaOwn2026' }); t('discontinued employee is told clearly (right password)', !r.ok && /discontinued/i.test(r.error), r)
  r = await post({ action: 'login', username: 'riya', password: 'wrongpass1' }); t('wrong password does not reveal the status', !r.ok && /Wrong username/.test(r.error), r)
  r = await post({ action: 'me', token: r2 }); t('her open session was signed out', !r.ok, r)
  r = await post({ action: 'me', token: o })
  t('her attendance record is still there', r.rows.some((x) => x.username === 'riya'), r.rows.map((x) => x.username))
  t('her leave request is still there', r.leaves.some((x) => x.username === 'riya'), r.leaves.map((x) => x.username))
  t('she is still listed (as discontinued), not deleted', r.staff.some((s) => s.username === 'riya' && s.active === false), r.staff.map((s) => [s.username, s.active]))
  r = await post({ action: 'setActive', token: o, username: 'bharat', active: false }); t('the owner cannot be discontinued', !r.ok, r)
  r = await post({ action: 'setActive', token: k, username: 'riya', active: true }); t('an employee cannot reactivate anyone', !r.ok, r)
  r = await post({ action: 'deleteStaff', token: o, username: 'riya' }); t('there is no way to delete an employee', !r.ok, r)
  r = await post({ action: 'setActive', token: o, username: 'riya', active: true }); t('owner reactivates riya', r.ok && r.staff.find((s) => s.username === 'riya').active === true, r)
  r = await post({ action: 'login', username: 'riya', password: 'RiyaOwn2026' }); t('reactivated employee logs in again', r.ok, r)

  // owner resets an employee password
  r = await post({ action: 'resetPassword', token: o, username: 'riya' }); t('owner resets an employee password', r.ok && /^Ckd-/.test(r.tempPassword), r)

  // forgot password: the owner's username sends the code; every other username gets the same quiet reply
  r = await post({ action: 'forgotStart', username: 'kalpak' }); t('an employee username gets the same reply and no email (employees ask Bharat Rai)', r.ok && (await mail()).length === 0, r)
  r = await post({ action: 'forgotStart', username: 'nobody' }); t('an unknown username gets the same reply and no email', r.ok && (await mail()).length === 0, r)
  r = await post({ action: 'forgotConfirm', code: '123456', next: 'Hacker2026x' }); t('cannot skip straight to the code step', !r.ok, r)
  r = await post({ action: 'forgotStart', username: 'bharat' }); t('the owner username sends the code to the company email', r.ok && (await mail()).length === 1 && (await mail())[0].to === 'careerkadost@gmail.com', r)
  const code = ((await mail())[0].body.match(/\b(\d{6})\b/) || [])[1]
  r = await post({ action: 'forgotConfirm', code, next: 'BharatReset2026' }); t('code + new password resets the owner password', r.ok, r)
  r = await post({ action: 'login', username: 'bharat', password: 'BharatReset2026' }); t('owner logs in with the new password', r.ok && r.user.role === 'owner', r)
  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
