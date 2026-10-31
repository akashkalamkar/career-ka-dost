// Daily Notice (portal-v16): the public 'notices' action lists the PDFs in Drive > "CKD Daily Notices".
const B = 'http://localhost:8787'
const post = async (body) => (await fetch(B, { method: 'POST', body: JSON.stringify(body) })).json()
const add = (q) => fetch(B + '/__addfile?' + new URLSearchParams({ folder: 'CKD Daily Notices', mime: 'application/pdf', ...q })).then((r) => r.json())
const evalGs = (code) => fetch(B + '/__eval?code=' + encodeURIComponent(code)).then((r) => r.json())
let pass = 0, bad = 0
const t = (name, cond, extra) => { cond ? pass++ : bad++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  ' + JSON.stringify(extra))) }

;(async () => {
  let r = await post({ action: 'notices' })
  t('works without logging in', r.ok === true, r)
  t('empty folder gives an empty list (folder is created)', Array.isArray(r.notices) && r.notices.length === 0, r)
  const drive = await (await fetch(B + '/__drive')).json()
  t('folder "CKD Daily Notices" now exists in Drive', drive.folders.some((f) => f.name === 'CKD Daily Notices'), drive)

  await add({ name: 'NEET_UG_2026_Notices_30-10-2026.pdf', created: '2026-10-30T10:30:00' })
  await add({ name: 'NEET_UG_2026_Notices_31-10-2026.pdf', created: '2026-10-31T10:31:00' })
  await add({ name: 'NEET_UG_2026_Notices_31-10-2026_5-15PM.pdf', created: '2026-10-31T17:20:00' })
  await add({ name: 'notes.docx', created: '2026-11-01T09:00:00', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  await add({ name: 'old-deleted.pdf', created: '2026-11-01T09:00:00', trashed: '1' })
  await add({ name: 'cannot-share.pdf', created: '2026-11-01T09:30:00', locked: '1' })

  r = await post({ action: 'notices' })
  t('still the cached (empty) answer for up to 5 minutes', r.notices.length === 0, r)
  await evalGs("CacheService.getScriptCache().remove('notices'); 'ok'")
  r = await post({ action: 'notices' })
  const names = r.notices.map((n) => n.name)
  t('lists only PDFs that are not in the bin', names.length === 3 && !names.includes('notes.docx') && !names.includes('old-deleted.pdf'), names)
  t('a PDF that cannot be made public is left out', !names.includes('cannot-share.pdf'), names)
  t('newest first', names[0] === 'NEET_UG_2026_Notices_31-10-2026_5-15PM.pdf' && names[2] === 'NEET_UG_2026_Notices_30-10-2026.pdf', names)
  t('each has id, name and IST date/time', r.notices.every((n) => n.id && n.name && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(n.created)) && r.notices[0].created === '2026-10-31 17:20', r.notices)
  const access = await (await fetch(B + '/__notice-access')).json()
  t('listed PDFs are made viewable by anyone with the link', access.filter(([n]) => names.includes(n)).every(([, a]) => a === 'ANYONE_WITH_LINK'), access)
  t('nothing is deleted from the folder', access.length === 6, access)

  for (let i = 0; i < 65; i++) await add({ name: `bulk-${String(i).padStart(2, '0')}.pdf`, created: `2026-09-${String((i % 28) + 1).padStart(2, '0')}T08:00:00` })
  await evalGs("CacheService.getScriptCache().remove('notices'); 'ok'")
  r = await post({ action: 'notices' })
  t('at most 60 are sent, newest kept', r.notices.length === 60 && r.notices[0].name === 'NEET_UG_2026_Notices_31-10-2026_5-15PM.pdf', r.notices.length)
  r = await (await fetch(B)).json()
  t('version is portal-v16', r.version === 'portal-v16', r)

  console.log(`\n${pass} passed, ${bad} failed`)
  process.exit(bad ? 1 : 0)
})()
