const B = 'http://localhost:8787'
const post = async (body) => (await fetch(B, { method: 'POST', body: JSON.stringify(body) })).json()
const clock = (v) => fetch(B + '/__time?ist=' + v).then((r) => r.text())
const mail = async () => (await fetch(B + '/__mail')).json()
const evalIn = async (code) => (await fetch(B + '/__eval?code=' + encodeURIComponent(code))).json()
let pass = 0, bad = 0
const t = (name, cond, extra) => { cond ? pass++ : bad++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  ' + JSON.stringify(extra))) }

;(async () => {
  await clock('2026-10-19T09:00:00')

  // --- the owner: fixed username brxxckd1010, first password brxxckd1010@123
  let r = await post({ action: 'login', username: 'bharat', password: 'bharat@123' }); t('the old name "bharat" no longer exists', !r.ok, r)
  r = await post({ action: 'login', username: 'brxxckd1010', password: 'brxxckd1010@123' })
  t('owner logs in with brxxckd1010 and the first password brxxckd1010@123', r.ok && r.user.role === 'owner' && r.user.mustChange === true && !('needsUsername' in r.user), r)
  const ot0 = r.token
  r = await post({ action: 'checkin', token: ot0 }); t('he must change the password before anything else', !r.ok && /own password/i.test(r.error), r)
  r = await post({ action: 'changePassword', token: ot0, current: 'brxxckd1010@123', next: 'short' }); t('weak password refused', !r.ok, r)
  r = await post({ action: 'changePassword', token: ot0, current: 'brxxckd1010@123', next: 'OwnerSecret2026', newUsername: 'someone.else9' })
  t('password changed, and a typed new username is ignored (fixed)', r.ok && r.user.username === 'brxxckd1010' && r.user.mustChange === false, r)
  r = await post({ action: 'login', username: 'someone.else9', password: 'OwnerSecret2026' }); t('that other username does not exist', !r.ok, r)
  r = await post({ action: 'login', username: 'brxxckd1010', password: 'brxxckd1010@123' }); t('first password no longer works', !r.ok, r)
  r = await post({ action: 'login', username: 'BRXXCKD1010', password: 'OwnerSecret2026' }); t('login works with the new password (capitals in username ignored)', r.ok && r.user.username === 'brxxckd1010', r)
  const o = r.token

  // --- adding employees: the owner picks a FIXED username, the first password is username@123
  const bads = [['abc', 'too short'], ['riyasharma', 'no number'], ['Riya 2026', 'has a space'], ['9riya1', 'starts with a number'], ['admin123', 'reserved word'], ['x'.repeat(31) + '1', 'too long'], ['ri$a2026', 'bad character']]
  for (const [name, why] of bads) { r = await post({ action: 'addStaff', token: o, name: 'Riya Sharma', username: name }); t('username refused: ' + name + ' (' + why + ')', !r.ok, r) }
  r = await post({ action: 'addStaff', token: o, name: 'R', username: 'riya2026' }); t('a too-short name is refused', !r.ok, r)
  r = await post({ action: 'addStaff', token: o, name: 'Kalpak Again', username: 'KALPAK1484' }); t('a username already used is refused (any capitals)', !r.ok && /already/i.test(r.error), r)
  r = await post({ action: 'addStaff', token: o, name: 'Riya Sharma', username: 'riya2026', password: 'IgnoredPassword9' })
  t('owner adds Riya with the username he chose', r.ok && r.added.username === 'riya2026' && r.staff.some((s) => s.username === 'riya2026' && s.mustChange === true), r.added)
  t('her first password is exactly username@123, whatever was typed', r.added.password === 'riya2026@123', r.added)
  r = await post({ action: 'login', username: 'riya2026', password: 'IgnoredPassword9' }); t('the typed password does not work', !r.ok, r)
  r = await post({ action: 'login', username: 'riya2026', password: 'riya2026@123' }); t('she logs in with riya2026 / riya2026@123 and must change the password', r.ok && r.user.mustChange === true, r)
  const rt = r.token
  r = await post({ action: 'changePassword', token: rt, current: 'riya2026@123', next: 'RiyaOwn2026', newUsername: 'riya.new77' }); t('she changes the password; the username stays riya2026', r.ok && r.user.username === 'riya2026', r)
  r = await post({ action: 'login', username: 'riya2026', password: 'RiyaOwn2026' }); const r2 = r.token
  t('she is in with her new password', r.ok && r.user.mustChange === false, r)
  r = await post({ action: 'changePassword', token: r2, current: 'RiyaOwn2026', next: 'RiyaOwn2027', newUsername: 'riya.new77' }); t('later password changes cannot change the username either', r.ok && r.user.username === 'riya2026', r)

  // --- no way to change a username at all
  for (const action of ['setUsername', 'renameStaff', 'changeUsername']) { r = await post({ action, token: o, username: 'riya2026', newUsername: 'x1y2z3w4' }); t('no such action: ' + action, !r.ok && /Unknown/i.test(r.error), r) }
  r = await post({ action: 'me', token: o }); t('the staff list shows the fixed usernames', ['brxxckd1010', 'kalpak1484', 'riya2026'].every((u) => r.staff.some((s) => s.username === u)), r.staff.map((s) => s.username))

  // --- a reset by the owner changes only the password
  r = await post({ action: 'resetPassword', token: o, username: 'riya2026' }); const temp = r.tempPassword
  r = await post({ action: 'login', username: 'riya2026', password: temp }); t('after a reset: temporary password, must change it', r.ok && r.user.mustChange === true, r)
  r = await post({ action: 'changePassword', token: r.token, current: temp, next: 'RiyaAgain2026' }); t('only the password changes, username still riya2026', r.ok && r.user.username === 'riya2026', r)

  // --- people created earlier get their fixed usernames with applyFixedUsernames()
  r = await post({ action: 'login', username: 'kalpak1484', password: 'kalpak1484@123' })
  await post({ action: 'changePassword', token: r.token, current: 'kalpak1484@123', next: 'KalpakOwn2026' })
  r = await post({ action: 'login', username: 'kalpak1484', password: 'KalpakOwn2026' }); const kt = r.token
  await post({ action: 'checkin', token: kt })
  await post({ action: 'applyLeave', token: kt, type: 'full', from: '2026-10-28', reason: 'Family trip' })
  // pretend this account still has its old name (as in the sheet before this update)
  await evalIn("(function(){ var st=SpreadsheetApp.getActiveSpreadsheet(); ['Staff','Attendance','Leaves'].forEach(function(n){ var s=st.getSheetByName(n); var col=(n==='Staff')?1:2; var rows=s.getRange(2,col,s.getLastRow()-1,1).getValues(); for(var i=0;i<rows.length;i++) if(rows[i][0]==='kalpak1484') s.getRange(i+2,col).setValue('kalpak') }); return 1 })()")
  r = await post({ action: 'login', username: 'kalpak', password: 'KalpakOwn2026' }); t('before the fix the old name "kalpak" is in use', r.ok, r)
  await evalIn('applyFixedUsernames()')
  r = await post({ action: 'login', username: 'kalpak', password: 'KalpakOwn2026' }); t('after applyFixedUsernames the old name is gone', !r.ok, r)
  r = await post({ action: 'login', username: 'kalpak1484', password: 'kalpak1484@123' }); t('the fixed username works with the first password and must change it', r.ok && r.user.mustChange === true, r)
  r = await post({ action: 'me', token: o })
  t('her attendance followed the fixed username', r.rows.some((x) => x.username === 'kalpak1484') && !r.rows.some((x) => x.username === 'kalpak'), r.rows.map((x) => x.username))
  t('her leave request followed the fixed username', r.leaves.some((x) => x.username === 'kalpak1484') && !r.leaves.some((x) => x.username === 'kalpak'), r.leaves.map((x) => x.username))
  await evalIn('applyFixedUsernames()')
  r = await post({ action: 'login', username: 'kalpak1484', password: 'kalpak1484@123' }); t('running it again changes nothing (safe to repeat)', r.ok && r.user.mustChange === true, r)

  // --- setFirstPasswords only touches people who still have to choose a password
  r = await post({ action: 'login', username: 'brxxckd1010', password: 'OwnerSecret2026' }); t('owner password before', r.ok, r)
  await evalIn('setFirstPasswords()')
  r = await post({ action: 'login', username: 'brxxckd1010', password: 'OwnerSecret2026' }); t('the owner (already chose a password) is left alone', r.ok, r)
  r = await post({ action: 'login', username: 'mallika', password: 'mallika@123' }); t('someone who has not logged in yet still has username@123', r.ok && r.user.mustChange, r)

  // --- forgot password uses the owner's fixed username and does not leak it
  await clock('2026-10-19T12:00:00')
  let s = await post({ action: 'forgotStart', username: 'bharat' }); t('the old name gets the same reply as anyone else', s.ok && !!s.sentTo, s)
  t('but no email is sent for the old name', (await mail()).length === 0)
  s = await post({ action: 'forgotStart', username: 'brxxckd1010' }); t('the owner\'s fixed username sends the email', s.ok, s)
  const box = await mail(); t('exactly one email, to the company address', box.length === 1 && box[0].to === 'careerkadost@gmail.com', box)
  const code = (box[0].body.match(/\b(\d{6})\b/) || [])[1]
  r = await post({ action: 'forgotConfirm', code, next: 'OwnerBack2026' }); t('he resets with the code', r.ok, r)
  r = await post({ action: 'login', username: 'brxxckd1010', password: 'OwnerBack2026' }); t('and logs in with the same fixed username', r.ok && r.user.username === 'brxxckd1010' && r.user.mustChange === false, r)
  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
