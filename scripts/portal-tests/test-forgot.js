const B = 'http://localhost:8787'
// Usernames are fixed. The tests keep using plain names (bharat, kalpak...), and this wrapper turns
// them into the real fixed usernames, and turns the replies back.
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
const codeOf = (m) => (m.body.match(/\b(\d{6})\b/) || [])[1]
const at = (hms) => clock('2026-10-19T' + hms)
const ask = (username = 'bharat') => post({ action: 'forgotStart', username })

;(async () => {
  await at('09:00:00')
  // the owner and kalpak both choose their own password first
  let r = await post({ action: 'login', username: 'bharat', password: 'bharat@123' })
  await post({ action: 'changePassword', token: r.token, current: 'bharat@123', next: 'BharatOld2026' })
  r = await post({ action: 'login', username: 'bharat', password: 'BharatOld2026' }); const oldToken = r.token
  r = await post({ action: 'login', username: 'kalpak', password: 'kalpak@123' })
  await post({ action: 'changePassword', token: r.token, current: 'kalpak@123', next: 'KalpakKeep2026' })

  // 1. the owner's username sends the code to the company email, and nowhere else
  r = await ask('bharat')
  let box = await mail()
  t('owner username: the code is emailed to the company address only', r.ok && box.length === 1 && box[0].to === 'careerkadost@gmail.com', [r, box.length])
  t('the reply masks the address and never contains the code', r.sentTo === 'c**********t@gmail.com' && !/\d{6}/.test(JSON.stringify(r)), r)
  const code1 = codeOf(box[0]); t('the email holds a 6-digit code', /^\d{6}$/.test(code1), box[0])

  // 2. every other username gets the very same reply, and no email
  const sameShape = JSON.stringify(Object.keys(r).sort())
  for (const who of ['kalpak', 'nobody', 'bharat1010', 'brxckd1010']) {
    const x = await ask(who)
    t('username "' + who + '": same reply, no way to tell', x.ok && JSON.stringify(Object.keys(x).sort()) === sameShape && x.sentTo === r.sentTo, x)
  }
  t('and no extra email was sent for them', (await mail()).length === 1)
  r = await ask('bharat'); t('asking again right away: same reply, but no second email (anti-spam)', r.ok && (await mail()).length === 1, r)

  // 3. guessing the code
  r = await post({ action: 'forgotConfirm', code: code1, next: 'short' }); t('weak new password refused', !r.ok, r)
  r = await post({ action: 'forgotConfirm', code: '000000' === code1 ? '111111' : '000000', next: 'BharatNew2026' }); t('wrong code refused, tries counted', !r.ok && /4 more/.test(r.error), r)
  for (let i = 0; i < 3; i++) await post({ action: 'forgotConfirm', code: '999999' === code1 ? '888888' : '999999', next: 'BharatNew2026' })
  r = await post({ action: 'forgotConfirm', code: '999999' === code1 ? '888888' : '999999', next: 'BharatNew2026' }); t('5th wrong guess burns the code', !r.ok && /Too many/.test(r.error), r)
  r = await post({ action: 'forgotConfirm', code: code1, next: 'BharatNew2026' }); t('even the right code no longer works after burning', !r.ok && /expired|not requested/i.test(r.error), r)
  r = await post({ action: 'login', username: 'bharat', password: 'BharatOld2026' }); t('password unchanged after all that', r.ok, r)

  // 4. a good reset
  await at('09:02:00')
  r = await ask('bharat'); box = await mail(); t('a new code is sent after the cooldown', r.ok && box.length === 2, box.length)
  const code2 = codeOf(box[box.length - 1])
  r = await post({ action: 'forgotConfirm', code: code2, next: 'BharatNew2026' }); t('correct code + good password resets', r.ok, r)
  box = await mail(); t('a "password changed" notice is emailed', /changed/i.test(box[box.length - 1].subject), box[box.length - 1])
  r = await post({ action: 'login', username: 'bharat', password: 'BharatNew2026' }); t('new password logs in, no forced change, same fixed username', r.ok && r.user.mustChange === false && r.user.role === 'owner' && r.user.username === 'bharat', r)
  r = await post({ action: 'login', username: 'bharat', password: 'BharatOld2026' }); t('old password is dead', !r.ok, r)
  r = await post({ action: 'me', token: oldToken }); t('old logged-in session was signed out', !r.ok, r)
  r = await post({ action: 'forgotConfirm', code: code2, next: 'Another2026x' }); t('a used code cannot be reused', !r.ok, r)
  r = await post({ action: 'login', username: 'kalpak', password: 'KalpakKeep2026' }); t('an employee password is untouched', r.ok, r)

  // 5. expiry
  await at('09:10:00')
  await ask('bharat'); box = await mail(); const code3 = codeOf(box[box.length - 1])
  await at('09:26:30')
  r = await post({ action: 'forgotConfirm', code: code3, next: 'BharatLate2026' }); t('a code expires after 15 minutes', !r.ok && /expired/i.test(r.error), r)

  // 6. a reset also lifts a login lock-out
  await at('10:00:00')
  for (let i = 0; i < 5; i++) await post({ action: 'login', username: 'bharat', password: 'nope' + i })
  r = await post({ action: 'login', username: 'bharat', password: 'BharatNew2026' }); t('5 wrong logins lock the owner', !r.ok && /Too many/.test(r.error), r)
  await at('10:02:00')
  await ask('bharat'); box = await mail(); const code4 = codeOf(box[box.length - 1])
  r = await post({ action: 'forgotConfirm', code: code4, next: 'BharatFresh2026' }); t('reset works while locked', r.ok, r)
  r = await post({ action: 'login', username: 'bharat', password: 'BharatFresh2026' }); t('the lock is cleared by the reset', r.ok, r)

  // 7. caps against email flooding and username guessing
  await at('11:00:00')
  const before = (await mail()).length
  for (let i = 0; i < 9; i++) { await at('11:' + String(i * 2).padStart(2, '0') + ':30'); await ask('bharat') }
  const sent = (await mail()).length - before
  t('never more than 5 emails in an hour, however often it is asked (' + ((await mail()).length) + ' sent in this whole test, ' + sent + ' in this burst)', sent <= 5 && sent >= 1, sent)
  await at('12:00:00')
  let paused = false
  for (let i = 0; i < 14; i++) { const x = await ask('guess' + i); if (!x.ok && /Too many/.test(x.error)) { paused = true; break } }
  t('guessing usernames pauses the page after 10 tries', paused)

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
