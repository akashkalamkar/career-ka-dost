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
  t('employee login carries leaves array', Array.isArray(kb.leaves) && kb.leaves.length === 0, kb)
  t('owner login carries staff + pendingLeaves', Array.isArray(ob.staff) && ob.pendingLeaves === 0, ob)

  // the owner does not check in or out
  let r = await post({ action: 'checkin', token: o }); t('owner cannot check in', !r.ok && /owner/i.test(r.error), r)
  r = await post({ action: 'checkout', token: o }); t('owner cannot check out', !r.ok && /owner/i.test(r.error), r)
  r = await post({ action: 'applyLeave', token: o, type: 'full', from: '2026-10-21', reason: 'x y z' }); t('owner does not apply for leave', !r.ok, r)

  // applying
  r = await post({ action: 'applyLeave', token: k, type: 'full', from: '2026-10-21', to: '2026-10-22', reason: 'Family function' })
  t('full-day leave applied, 2 days, Pending', r.ok && r.applied.days === 2 && r.applied.status === 'Pending' && r.applied.type === 'Full day' && r.leaves.length === 1, r)
  const leaveFull = r.applied.id
  r = await post({ action: 'applyLeave', token: k, type: 'full', from: '2026-10-22', reason: 'Overlap' }); t('overlapping dates rejected', !r.ok && /already/i.test(r.error), r)
  r = await post({ action: 'applyLeave', token: k, type: 'half', from: '2026-10-23', reason: 'Doctor' }); t('half day needs a half', !r.ok && /half/i.test(r.error), r)
  r = await post({ action: 'applyLeave', token: k, type: 'half', from: '2026-10-23', half: 'First half', reason: 'Doctor' }); t('half day (first half) applied = 0.5', r.ok && r.applied.days === 0.5 && r.applied.half === 'First half' && r.applied.to === '2026-10-23', r)
  const leaveHalf = r.applied.id
  r = await post({ action: 'applyLeave', token: k, type: 'half', from: '2026-10-23', half: 'Second half', reason: 'Bank work' }); t('second half same day allowed', r.ok, r)
  r = await post({ action: 'applyLeave', token: k, type: 'half', from: '2026-10-23', half: 'First half', reason: 'Again' }); t('same half twice rejected', !r.ok, r)
  r = await post({ action: 'applyLeave', token: k, type: 'full', from: '2026-10-23', reason: 'Whole day' }); t('full day over a half day rejected', !r.ok, r)
  r = await post({ action: 'applyLeave', token: k, type: 'full', from: '2026-10-18', reason: 'Yesterday' }); t('past date rejected', !r.ok && /later|today/i.test(r.error), r)
  r = await post({ action: 'applyLeave', token: k, type: 'full', from: 'banana', reason: 'x y z' }); t('bad date rejected', !r.ok, r)
  r = await post({ action: 'applyLeave', token: k, type: 'full', from: '2026-11-10', to: '2026-11-09', reason: 'x y z' }); t('end before start rejected', !r.ok, r)
  r = await post({ action: 'applyLeave', token: k, type: 'full', from: '2026-11-10', reason: '  ' }); t('empty reason rejected', !r.ok && /reason/i.test(r.error), r)
  r = await post({ action: 'applyLeave', token: k, type: 'full', from: '2027-01-01', to: '2027-04-01', reason: 'Long trip' }); t('more than 60 days rejected', !r.ok, r)

  // privacy
  r = await post({ action: 'applyLeave', token: m, type: 'full', from: '2026-10-26', reason: 'Wedding' }); t('mallika applies', r.ok && r.leaves.length === 1, r)
  const leaveMallika = r.applied.id
  r = await post({ action: 'me', token: k }); t('kalpak sees only his 3 requests', r.leaves.length === 3 && r.leaves.every((x) => x.username === 'kalpak'), r.leaves.map((x) => x.username))
  r = await post({ action: 'decideLeave', token: k, id: leaveFull, decision: 'Accepted' }); t('employee cannot accept leave', !r.ok, r)
  r = await post({ action: 'cancelLeave', token: k, id: leaveMallika }); t('cannot cancel someone elses leave', !r.ok, r)

  // owner sees all and decides
  r = await post({ action: 'me', token: o }); t('owner sees all 4 requests, 4 pending', r.leaves.length === 4 && r.pendingLeaves === 4, [r.leaves.length, r.pendingLeaves])
  r = await post({ action: 'decideLeave', token: o, id: leaveFull, decision: 'Accepted' }); t('owner accepts', r.ok && r.leaves.find((x) => x.id === leaveFull).status === 'Accepted' && r.leaves.find((x) => x.id === leaveFull).decidedBy === 'Bharat Rai' && r.pendingLeaves === 3, r)
  r = await post({ action: 'decideLeave', token: o, id: leaveMallika, decision: 'Rejected' }); t('owner rejects', r.ok && r.leaves.find((x) => x.id === leaveMallika).status === 'Rejected', r)
  r = await post({ action: 'decideLeave', token: o, id: leaveMallika, decision: 'Accepted' }); t('owner can change his mind', r.ok && r.leaves.find((x) => x.id === leaveMallika).status === 'Accepted', r)
  r = await post({ action: 'decideLeave', token: o, id: leaveMallika, decision: 'Maybe' }); t('bad decision rejected', !r.ok, r)
  r = await post({ action: 'decideLeave', token: o, id: 'NOPE', decision: 'Accepted' }); t('unknown id rejected', !r.ok, r)
  r = await post({ action: 'me', token: k }); t('employee sees Accepted status', r.leaves.find((x) => x.id === leaveFull).status === 'Accepted', r.leaves)

  // cancel
  r = await post({ action: 'cancelLeave', token: k, id: leaveFull }); t('cannot cancel an accepted leave', !r.ok, r)
  r = await post({ action: 'cancelLeave', token: k, id: leaveHalf }); t('employee cancels own pending leave', r.ok && r.leaves.find((x) => x.id === leaveHalf).status === 'Cancelled', r)
  r = await post({ action: 'decideLeave', token: o, id: leaveHalf, decision: 'Accepted' }); t('owner cannot decide a cancelled request', !r.ok, r)
  r = await post({ action: 'applyLeave', token: k, type: 'half', from: '2026-10-23', half: 'First half', reason: 'Re-apply after cancel' }); t('can re-apply after cancelling', r.ok, r)

  // on leave today shows to the owner
  await clock('2026-10-21T09:30:00')
  r = await post({ action: 'login', username: 'bharat', password: 'BharatNew2026' })
  const kal = r.staff.find((s) => s.username === 'kalpak'); const mal = r.staff.find((s) => s.username === 'mallika')
  t('owner sees kalpak on full-day leave today', kal.leave && kal.leave.type === 'Full day', kal)
  t('mallika (leave on the 26th) is not on leave today', mal.leave === null, mal)

  // owner still has no attendance rows of his own, employees still check in normally
  r = await post({ action: 'login', username: 'nandini', password: 'nandini@123' }); const nt = r.token
  await post({ action: 'changePassword', token: nt, current: 'nandini@123', next: 'NandiniNew2026' })
  r = await post({ action: 'login', username: 'nandini', password: 'NandiniNew2026' })
  r = await post({ action: 'checkin', token: r.token }); t('employees still check in', r.ok && r.today.status === 'On time', r)

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
