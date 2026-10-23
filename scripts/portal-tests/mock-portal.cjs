// Runs scripts/staff-portal-google-apps-script.gs against an in-memory fake of Google's services,
// and serves it over http://localhost:8787 so the website can talk to it. Test use only.
const fs = require('fs')
const vm = require('vm')
const http = require('http')
const crypto = require('crypto')

const SRC = process.argv[2]
const PORT = Number(process.argv[3] || 8787)
let code = fs.readFileSync(SRC, 'utf8')
if (process.env.TEST_PASSWORDS === '1') code = code.replace(/<<PASSWORD>>/g, 'Start1234')

// ---- fake Sheets ----
class Range {
  constructor(sheet, r, c, nr, nc) { Object.assign(this, { sheet, r, c, nr, nc }) }
  getValues() { const out = []; for (let i = 0; i < this.nr; i++) { const row = []; for (let j = 0; j < this.nc; j++) row.push(this.sheet.cell(this.r + i, this.c + j)); out.push(row) } return out }
  setValues(v) { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sheet.put(this.r + i, this.c + j, v[i][j]); return this }
  getValue() { return this.sheet.cell(this.r, this.c) }
  setValue(v) { this.sheet.put(this.r, this.c, v); return this }
  setNumberFormat() { return this }
  setFontWeight() { return this }
  setBackground() { return this }
}
class Sheet {
  constructor(name) { this.name = name; this.rows = []; this.maxRows = 1000 }
  cell(r, c) { return (this.rows[r - 1] && this.rows[r - 1][c - 1] !== undefined) ? this.rows[r - 1][c - 1] : '' }
  put(r, c, v) { while (this.rows.length < r) this.rows.push([]); this.rows[r - 1][c - 1] = v }
  getLastRow() { return this.rows.length }
  getMaxRows() { return this.maxRows }
  getRange(r, c, nr = 1, nc = 1) { return new Range(this, r, c, nr, nc) }
  appendRow(vals) { this.rows.push(vals.slice()) }
  setFrozenRows() {}
  setConditionalFormatRules() {}
}
const sheets = {}
const ss = {
  getSheetByName: (n) => sheets[n] || null,
  insertSheet: (n) => (sheets[n] = new Sheet(n)),
}
const rule = { whenFormulaSatisfied() { return this }, setBackground() { return this }, setFontColor() { return this }, setRanges() { return this }, build() { return {} } }

// ---- fake clock (IST) ----
let fakeNow = null
class MockDate extends Date {
  constructor(...a) { if (a.length === 0 && fakeNow !== null) super(fakeNow); else super(...a) }
  static now() { return fakeNow !== null ? fakeNow : Date.now() }
}

const outbox = []
const nowMs = () => (fakeNow !== null ? fakeNow : Date.now())
const props = {}
const cacheStore = {}
const ctx = {
  console, Date: MockDate, JSON, Math, Number, String, Object, Array, Error, RegExp, Boolean,
  Logger: { log: (m) => console.log('[Logger]', m) },
  SpreadsheetApp: { getActiveSpreadsheet: () => ss, newConditionalFormatRule: () => Object.create(rule) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  PropertiesService: { getScriptProperties: () => ({
    getProperty: (k) => (k in props ? props[k] : null),
    setProperty: (k, v) => { props[k] = v },
    deleteProperty: (k) => { delete props[k] },
    getProperties: () => ({ ...props }),
  }) },
  CacheService: { getScriptCache: () => ({
    get: (k) => (cacheStore[k] && cacheStore[k].exp > nowMs() ? cacheStore[k].v : null),
    put: (k, v, ttl) => { cacheStore[k] = { v, exp: ttl ? nowMs() + ttl * 1000 : Infinity } },
    remove: (k) => { delete cacheStore[k] },
  }) },
  MailApp: { sendEmail: (to, subject, body) => { outbox.push({ to, subject, body }) } },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ text: t, setMimeType() { return this } }) },
  Utilities: {
    DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
    computeDigest: (alg, s) => Array.from(crypto.createHash('sha256').update(s, 'utf8').digest()).map((b) => (b > 127 ? b - 256 : b)),
    getUuid: () => crypto.randomUUID(),
    formatDate: (d, tz, fmt) => {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(d).map((x) => [x.type, x.value]))
      return fmt.replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day).replace('HH', p.hour).replace('mm', p.minute).replace('ss', p.second)
    },
  },
}
vm.createContext(ctx)
vm.runInContext(code, ctx)

if (process.env.RUN_SETUP === '1') vm.runInContext('setupPortal()', ctx)
if (process.env.RUN_EXTRA) vm.runInContext(process.env.RUN_EXTRA, ctx)

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }
  // Test controls: /__time?ist=2026-10-19T10:09:59 sets the fake clock. /__time?ist=off uses the real clock.
  if (req.url.startsWith('/__time')) {
    const v = new URL(req.url, 'http://x').searchParams.get('ist')
    fakeNow = v && v !== 'off' ? new Date(v + '+05:30').getTime() : null
    res.writeHead(200); return res.end('clock ' + (fakeNow ? new Date(fakeNow).toISOString() : 'real'))
  }
  if (req.url.startsWith('/__eval')) { const code = new URL(req.url, 'http://x').searchParams.get('code'); let out; try { out = vm.runInContext(code, ctx) } catch (e) { out = 'ERROR: ' + e.message } res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(out === undefined ? null : out)) }
  if (req.url.startsWith('/__mail')) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(outbox)) }
  if (req.url.startsWith('/__sheet')) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(Object.fromEntries(Object.entries(sheets).map(([k, s]) => [k, s.rows.map((r) => r.map((c, i) => (k === 'Staff' && (i === 3 || i === 4) ? '…' : c)))]))))
  }
  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    const out = req.method === 'POST' ? ctx.doPost({ postData: { contents: body } }) : ctx.doGet()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(out.text)
  })
}).listen(PORT, () => console.log('mock portal on', PORT))
