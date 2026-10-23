// Runs every staff-portal test suite, each against a fresh in-memory fake of Google Apps Script.
// Usage (from the project folder):  node scripts/portal-tests/run-all.cjs
const { spawn, spawnSync } = require('child_process')
const path = require('path')

const here = __dirname
const gs = path.join(here, '..', 'staff-portal-google-apps-script.gs')
const suites = ['test-core.js', 'test-leave.js', 'test-forgot.js', 'test-staff.js', 'test-fixed.js']
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// setupPortal() now only creates the owner (Bharat Rai adds every employee himself from the Staff tab).
// The test suites still need kalpak1484/mallika/samiksha/nandini to exist from the start, so this seeds
// them the same way addStaff() would, right after setupPortal() runs, for test fixtures only.
const SEED_TEST_EMPLOYEES = `
(function () {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Staff')
  var extra = [
    ['kalpak1484', 'Kalpak Dorlikar'],
    ['mallika', 'Mallika Rahate'],
    ['samiksha', 'Samiksha Waghmare'],
    ['nandini', 'Nandini Atkar'],
  ]
  extra.forEach(function (e) {
    var salt = newSalt()
    sheet.appendRow([e[0], e[1], 'employee', salt, hashPassword(salt, e[0] + '@123'), true, true, ''])
  })
  staffMemo = null
})()
`

;(async () => {
  let failed = 0
  let passed = 0
  for (const suite of suites) {
    const mock = spawn(process.execPath, [path.join(here, 'mock-portal.cjs'), gs, '8787'], { stdio: 'ignore', env: { ...process.env, RUN_SETUP: '1', RUN_EXTRA: SEED_TEST_EMPLOYEES } })
    await wait(1000)
    const run = spawnSync(process.execPath, [path.join(here, suite)], { encoding: 'utf8' })
    mock.kill()
    await wait(300)
    const out = run.stdout || ''
    const summary = out.split('\n').filter((l) => /passed/.test(l)).pop() || '(no summary)'
    console.log(suite.padEnd(16), summary.trim())
    out.split('\n').filter((l) => /^FAIL/.test(l)).forEach((l) => console.log('   ', l))
    const m = summary.match(/(\d+) passed, (\d+) failed/)
    if (m) { passed += Number(m[1]); failed += Number(m[2]) } else failed++
  }
  console.log(`\nTOTAL: ${passed} passed, ${failed} failed`)
  process.exit(failed ? 1 : 0)
})()

