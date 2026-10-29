/**
 * Career Ka Dost - STAFF PORTAL backend (Google Apps Script).
 *
 * This is the "server" for the website's Staff login page (#/admin). It keeps the staff list, the
 * hashed passwords, the attendance records and the leave requests in a Google Sheet, and it works
 * out the check-in and check-out times itself, using India time, so nobody can type a different time.
 *
 * SET UP (once):
 *   1. Create a NEW Google Sheet, for example "CKD Staff Portal". Do not use the leads sheet.
 *   2. In that sheet: Extensions > Apps Script. Delete the sample code and paste this whole file.
 *   3. Choose "setupPortal" in the function list at the top and press Run. Approve the permissions.
 *      Everyone has a FIXED username and a first password that is always the username followed by @123
 *      (for example kalpak1484@123). At their first login they change the password. The username never changes.
 *   4. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy.
 *   5. Copy the Web app address (ends in /exec) into the website's .env file as VITE_ADMIN_API_URL,
 *      then rebuild the website. Opening the /exec address in a browser should show the version.
 *
 * If you change this file later, publish it with Deploy > New deployment and use the new address.
 *
 * Rules built in:
 *   - Check-in at 10:10:00 AM or later is LATE (red). Before 10:10 AM is ON TIME (green).
 *   - One check-in and one check-out per person per day. Times come from the server clock (IST).
 *   - Usernames are fixed: the owner chooses an employee's username when adding them, and nobody can change
 *     it afterwards. The first password is always the username followed by @123, and the person changes it
 *     at their first login.
 *   - Employees can change only their own password (they must know the current one).
 *   - The owner (Bharat Rai) does not check in or out. He adds employees, discontinues them (nothing is
 *     ever deleted), resets their passwords and decides their leave requests.
 *   - Only the owner can reset an employee's password.
 *   - Only the owner resets passwords: employees' from his Staff tab, and his own with an emailed code. If
 *     the owner forgets his own password he types his username on the login page, and a 6-digit code is
 *     emailed to OWNER_EMAIL. He types the code and a new password.
 *   - 5 wrong passwords lock that username for 15 minutes.
 */

const SCRIPT_VERSION = 'portal-v11'
const TZ = 'Asia/Kolkata'
const LATE_FROM_MINUTES = 10 * 60 + 10 // 10:10 AM
const SESSION_HOURS = 12
const MAX_FAILS = 5
const LOCK_MINUTES = 15
const HASH_ROUNDS = 150

const STAFF_SHEET = 'Staff'
const ATTENDANCE_SHEET = 'Attendance'
const STAFF_HEADERS = ['Username', 'Name', 'Role', 'Salt', 'Password hash', 'Must change password', 'Active', 'Last login']
const ATT_HEADERS = ['Date', 'Username', 'Name', 'Check-in', 'Check-out', 'Status', 'Hours worked']
const LEAVE_SHEET = 'Leaves'
const LEAVE_HEADERS = ['ID', 'Username', 'Name', 'Type', 'Half', 'From', 'To', 'Days', 'Reason', 'Applied on', 'Status', 'Decided by', 'Decided on']
const MAX_LEAVE_DAYS = 60

// Daily work report: one per person per day, written any time before they leave, visible to the owner by date.
const REPORT_SHEET = 'DailyReports'
const REPORT_HEADERS = ['Date', 'Username', 'Name', 'Report', 'Updated on']
const MAX_REPORT_CHARS = 4000

// Bill / invoice generator (added 29 Oct 2026): any logged-in staff member can create one. Every invoice is
// logged here for the record - who made it, for whom, what was charged, and what discount was given. The
// money is always recalculated on the server from the raw numbers sent (service prices, discount), never
// just trusted from the browser, so the sheet cannot show a total that does not actually add up. No GST:
// Career Ka Dost is not GST-registered, so a bill is just the services minus the discount.
const INVOICE_SHEET = 'Invoices'
const INVOICE_HEADERS = [
  'Invoice No', 'Date', 'Time', 'Created by (username)', 'Created by (name)',
  'Student name', 'Phone', 'Class / Course', 'City',
  'Services', 'Subtotal', 'Discount %', 'Discount amount', 'Total',
  'Payment mode', 'Payment status', 'Amount paid', 'Balance due', 'Notes',
]
const INVOICE_PREFIX = 'CKD'
const MAX_INVOICE_ITEMS = 20

// Forgot password (owner only): a 6-digit code is emailed to the company address below.
// The owner is the person whose role is "owner" in the Staff tab, whatever username he chose.
const OWNER_EMAIL = 'careerkadost@gmail.com'
const RESET_MINUTES = 15
const RESET_MAX_TRIES = 5
const RESET_COOLDOWN_SECONDS = 60
const RESET_MAX_PER_HOUR = 5

// How many times the forgot-password page may be tried (any username) before it pauses for a while.
const FORGOT_MAX_TRIES = 10
const RESERVED_WORDS = ['admin', 'owner', 'portal', 'staff', 'login', 'password']

// Fixed usernames for the people created earlier. Run applyFixedUsernames() once to apply this list.
// Keys are the people's names (as in the Staff tab), values are their fixed usernames. Add more lines if needed.
const USERNAME_FIXES = {
  'Bharat Rai': 'brxxckd1010',
  'Kalpak Dorlikar': 'kalpak1484',
  // 'Mallika Rahate': 'mallika0000',
  // 'Samiksha Waghmare': 'samiksha0000',
  // 'Nandini Atkar': 'nandini0000',
}

// Each sheet is read at most once per request (kept here, then cleared when something is written).
let staffMemo = null
let attendanceMemo = null
let leavesMemo = null
let reportsMemo = null
// Only these change data, so only these wait for the lock. Reading and logging in do not.
const WRITE_ACTIONS = { checkin: 1, checkout: 1, changePassword: 1, resetPassword: 1, forgotStart: 1, forgotConfirm: 1, addStaff: 1, setActive: 1, applyLeave: 1, cancelLeave: 1, decideLeave: 1, submitReport: 1, createInvoice: 1 }

/**
 * Only the owner is created automatically. He adds every employee himself from the Staff tab in the
 * portal (owner login > Staff > Add employee), choosing their username there; the first password is
 * always that username followed by @123, same as for the owner.
 */
const STAFF = [{ username: 'brxxckd1010', name: 'Bharat Rai', role: 'owner' }]

// ---------------------------------------------------------------------------------------------
// Set up
// ---------------------------------------------------------------------------------------------

/** Run once. Creates the tabs and the owner's account. Safe to run again: it never overwrites. */
function setupPortal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const staff = getOrCreateSheet(ss, STAFF_SHEET, STAFF_HEADERS)
  const att = getOrCreateSheet(ss, ATTENDANCE_SHEET, ATT_HEADERS)

  att.getRange(1, 1, 1, ATT_HEADERS.length).setFontWeight('bold').setBackground('#ffb81c')
  staff.getRange(1, 1, 1, STAFF_HEADERS.length).setValues([STAFF_HEADERS])
  staff.getRange(1, STAFF_HEADERS.length + 1).setValue('')
  staff.getRange(1, 1, 1, STAFF_HEADERS.length).setFontWeight('bold').setBackground('#ffb81c')
  att.setFrozenRows(1)
  staff.setFrozenRows(1)

  // Dates and times are kept as plain text so Sheets never reformats them.
  att.getRange(2, 1, att.getMaxRows() - 1, 5).setNumberFormat('@')

  // Colour the attendance rows: red for Late, green for On time.
  const range = att.getRange(2, 1, att.getMaxRows() - 1, ATT_HEADERS.length)
  att.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2="Late"').setBackground('#f8c9c9').setFontColor('#a40000').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2="On time"').setBackground('#d3f0d9').setFontColor('#0f6b2a').setRanges([range]).build(),
  ])

  // Grey out a discontinued person's whole row in the Staff tab (column G = Active).
  const staffRange = staff.getRange(2, 1, staff.getMaxRows() - 1, STAFF_HEADERS.length)
  staff.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$G2=FALSE').setBackground('#ece7df').setFontColor('#6b6558').setRanges([staffRange]).build(),
  ])

  leavesSheet()
  reportsSheet()

  const existing = readStaff()
  let added = 0
  STAFF.forEach(function (s) {
    if (existing.some(function (e) { return e.username === s.username })) return
    const password = s.username + '@123' // first password, e.g. kalpak1484@123. Each person changes it at their first login.
    const salt = newSalt()
    staff.appendRow([s.username, s.name, s.role, salt, hashPassword(salt, password), true, true, ''])
    added++
  })
  Logger.log('Portal ready. Staff accounts added: ' + added + '. Everyone logs in with their fixed username and the first password username@123, for example kalpak1484@123, and then changes the password. Now deploy as a Web app.')
}

/**
 * Emergency only: if the owner forgets the password AND cannot use the email reset, run this from the editor.
 * It sets a new temporary password for the owner and writes it in the Execution log.
 */
function resetOwnerPassword() {
  const owner = ownerRecord()
  if (!owner) throw new Error('No owner found in the Staff tab.')
  const temp = makeTempPassword()
  setPassword(owner.username, temp, true)
  clearSessionsFor(owner.username)
  Logger.log('New temporary password for the owner (username: ' + owner.username + '): ' + temp + '  (he must change it after logging in)')
}

/**
 * Optional safety button: for everyone who still has to choose their own password (first login pending, or
 * a password reset by the owner), sets the password back to their username followed by @123 (for example
 * kalpak1484@123). People who already chose their own password are not touched.
 */
function setFirstPasswords() {
  let count = 0
  readStaff().forEach(function (s) {
    if (!s.mustChange) return
    setPassword(s.username, s.username + '@123', true)
    clearSessionsFor(s.username)
    count++
  })
  Logger.log('Done for ' + count + ' people who have not chosen their own password yet. Their password is their username + @123, for example kalpak1484@123.')
}

/**
 * Run once after updating from an older version: gives the people created earlier their FIXED usernames from
 * USERNAME_FIXES above (matching by name). Their old attendance and leave records follow the new username.
 * Anyone renamed gets the first password username@123 and changes it at their next login.
 */
function applyFixedUsernames() {
  const sheet = sheetOf(STAFF_SHEET)
  Object.keys(USERNAME_FIXES).forEach(function (name) {
    const wanted = USERNAME_FIXES[name]
    const person = readStaff().filter(function (s) { return s.name === name })[0]
    if (!person) {
      Logger.log('Not found in the Staff tab: ' + name)
      return
    }
    if (person.username === wanted) {
      Logger.log(name + ' already has the username ' + wanted)
      return
    }
    if (findStaff(wanted)) {
      Logger.log('Cannot use ' + wanted + ' for ' + name + ': that username is already taken.')
      return
    }
    sheet.getRange(person.row, 1).setValue(wanted)
    staffMemo = null
    renameRecords(person.username, wanted)
    clearSessionsFor(person.username)
    setPassword(wanted, wanted + '@123', true)
    Logger.log(name + ': username is now ' + wanted + ' and the first password is ' + wanted + '@123')
  })
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name)
  if (!sheet) sheet = ss.insertSheet(name)
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  return sheet
}

// ---------------------------------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------------------------------

function doGet() {
  return json({ ok: true, version: SCRIPT_VERSION })
}

function doPost(e) {
  staffMemo = null
  attendanceMemo = null
  leavesMemo = null
  reportsMemo = null
  const lock = LockService.getScriptLock()
  let locked = false
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    if (WRITE_ACTIONS[String(req.action)]) {
      lock.waitLock(20000)
      locked = true
    }
    return json(route(req))
  } catch (err) {
    if (err && err.userMessage) return json({ ok: false, error: err.userMessage })
    const busy = String(err).indexOf('lock') !== -1
    return json({ ok: false, error: busy ? 'The portal is busy. Please try again.' : 'Something went wrong. Please try again.' })
  } finally {
    if (locked) lock.releaseLock()
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

function fail(message) {
  const err = new Error(message)
  err.userMessage = message
  throw err
}

function route(req) {
  const action = String(req.action || '')
  if (action === 'login') return login(req)
  if (action === 'forgotStart') return forgotStart(req)
  if (action === 'forgotConfirm') return forgotConfirm(req)

  const user = requireSession(req.token)
  if (action === 'logout') {
    PropertiesService.getScriptProperties().deleteProperty('S_' + req.token)
    return { ok: true }
  }
  if (action === 'changePassword') return changePassword(user, req)
  if (needsSetup(user)) fail('Please set your own password first.')

  switch (action) {
    case 'me': return me(user)
    case 'checkin': return checkIn(user)
    case 'checkout': return checkOut(user)
    case 'attendance': return attendance(user, req)
    case 'resetPassword': return resetPassword(user, req)
    case 'addStaff': return addStaff(user, req)
    case 'setActive': return setActive(user, req)
    case 'applyLeave': return applyLeave(user, req)
    case 'cancelLeave': return cancelLeave(user, req)
    case 'decideLeave': return decideLeave(user, req)
    case 'submitReport': return submitReport(user, req)
    case 'teamReports': return teamReports(user, req)
    case 'createInvoice': return createInvoice(user, req)
    case 'listInvoices': return listInvoices(user, req)
    default: fail('Unknown request.')
  }
}

// ---------------------------------------------------------------------------------------------
// Login, sessions and passwords
// ---------------------------------------------------------------------------------------------

function login(req) {
  const username = String(req.username || '').trim().toLowerCase()
  const password = String(req.password || '')
  if (!username || !password) fail('Enter your username and password.')

  const cache = CacheService.getScriptCache()
  const failKey = 'fail_' + username
  if (Number(cache.get(failKey) || 0) >= MAX_FAILS) fail('Too many wrong attempts. Please wait ' + LOCK_MINUTES + ' minutes, or ask Bharat Rai to reset your password.')

  const u = findStaff(username)
  const ok = u && safeEqual(u.hash, hashPassword(u.salt, password))
  if (!ok) {
    cache.put(failKey, String(Number(cache.get(failKey) || 0) + 1), LOCK_MINUTES * 60)
    fail('Wrong username or password.')
  }
  cache.remove(failKey)
  if (!u.active) fail('This account has been discontinued. Please contact Bharat Rai.')

  const token = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '')
  pruneSessions()
  PropertiesService.getScriptProperties().setProperty('S_' + token, JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600 * 1000 }))
  sheetOf(STAFF_SHEET).getRange(u.row, 8).setValue(nowStamp())
  // Everything the first screen needs comes back in this one reply, so the page opens without more waiting.
  if (needsSetup(u)) return { ok: true, token: token, user: publicUser(u), serverTime: nowParts() }
  const first = bootstrap(u)
  first.token = token
  return first
}

function requireSession(token) {
  if (!token) fail('Please log in.')
  const raw = PropertiesService.getScriptProperties().getProperty('S_' + token)
  if (!raw) fail('Session expired. Please log in again.')
  const s = JSON.parse(raw)
  if (s.exp < Date.now()) {
    PropertiesService.getScriptProperties().deleteProperty('S_' + token)
    fail('Session expired. Please log in again.')
  }
  const u = findStaff(s.u)
  if (!u || !u.active) fail('Session expired. Please log in again.')
  return u
}

function pruneSessions() {
  const props = PropertiesService.getScriptProperties()
  const all = props.getProperties()
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('S_') !== 0) return
    try {
      if (JSON.parse(all[k]).exp < Date.now()) props.deleteProperty(k)
    } catch (err) {
      props.deleteProperty(k)
    }
  })
}

function clearSessionsFor(username) {
  const props = PropertiesService.getScriptProperties()
  const all = props.getProperties()
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('S_') !== 0) return
    try {
      if (JSON.parse(all[k]).u === username) props.deleteProperty(k)
    } catch (err) {
      props.deleteProperty(k)
    }
  })
}

function passwordProblem(password) {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Use both letters and numbers.'
  return ''
}

/**
 * A person changes THEIR OWN password, and must know the current one. This is also the first-login step.
 * The username is fixed and never changes.
 */
function changePassword(user, req) {
  const current = String(req.current || '')
  const next = String(req.next || '')
  if (!safeEqual(user.hash, hashPassword(user.salt, current))) fail('The current password is not correct.')
  if (current === next) fail('Choose a different password from the current one.')
  const problem = passwordProblem(next)
  if (problem) fail(problem)
  setPassword(user.username, next, false)
  return { ok: true, user: publicUser(findStaff(user.username)) }
}

/** Why a username is not acceptable when the owner adds an employee (empty text when it is fine). */
function newUsernameProblem(name) {
  if (!/^[a-z][a-z0-9._]{3,29}$/.test(name)) return 'Username: 4 to 30 small letters or numbers, starting with a letter (dots and underscores are allowed, no spaces).'
  if (!/[0-9]/.test(name)) return 'Please include at least one number in the username, for example kalpak1484.'
  for (let j = 0; j < RESERVED_WORDS.length; j++) {
    if (name.indexOf(RESERVED_WORDS[j]) !== -1) return 'That username is not allowed. Please choose another.'
  }
  if (findStaff(name)) return 'That username is already used.'
  return ''
}

/** Used only by applyFixedUsernames: the old attendance and leave rows follow the new username. */
function renameRecords(oldName, newName) {
  ;[ATTENDANCE_SHEET, LEAVE_SHEET].forEach(function (tab) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tab)
    if (!sheet || sheet.getLastRow() < 2) return
    const range = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1)
    const values = range.getValues()
    let changed = false
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][0]).toLowerCase() === oldName) {
        values[i][0] = newName
        changed = true
      }
    }
    if (changed) range.setValues(values)
  })
  attendanceMemo = null
  leavesMemo = null
}

/** Owner only: sets a temporary password for someone else, who must change it at next login. */
function resetPassword(owner, req) {
  if (owner.role !== 'owner') fail('Only the owner can reset passwords.')
  const target = findStaff(String(req.username || '').toLowerCase())
  if (!target) fail('That staff member was not found.')
  if (target.username === owner.username) fail('Use "Change password" for your own password.')
  const temp = makeTempPassword()
  setPassword(target.username, temp, true)
  clearSessionsFor(target.username)
  return { ok: true, username: target.username, name: target.name, tempPassword: temp }
}

/**
 * Step 1: type the username. The reply is the SAME for every username, so nobody can find out which one is the
 * owner's. Only when the username is the owner's real, current username is a 6-digit code emailed to OWNER_EMAIL.
 */
function forgotStart(req) {
  const typed = String(req.username || '').trim().toLowerCase()
  const cache = CacheService.getScriptCache()
  const tries = Number(cache.get('fp_tries') || 0)
  if (tries >= FORGOT_MAX_TRIES) fail('Too many tries. Please wait ' + LOCK_MINUTES + ' minutes and try again.')
  cache.put('fp_tries', String(tries + 1), LOCK_MINUTES * 60)
  const owner = ownerRecord()
  if (owner && owner.active && typed === owner.username) trySendResetCode()
  return { ok: true, sentTo: maskEmail(OWNER_EMAIL), minutes: RESET_MINUTES }
}

/** Emails the 6-digit code (once a minute, five an hour at most). Quietly does nothing if a limit is reached. */
function trySendResetCode() {
  const cache = CacheService.getScriptCache()
  if (cache.get('reset_cool')) return false
  const hourly = Number(cache.get('reset_hour') || 0)
  if (hourly >= RESET_MAX_PER_HOUR) return false

  const code = makeCode()
  const salt = newSalt()
  cache.put('reset_code', JSON.stringify({ salt: salt, hash: hashPassword(salt, code), tries: 0, exp: Date.now() + RESET_MINUTES * 60 * 1000 }), RESET_MINUTES * 60)
  cache.put('reset_cool', '1', RESET_COOLDOWN_SECONDS)
  cache.put('reset_hour', String(hourly + 1), 3600)
  try {
    MailApp.sendEmail(
      OWNER_EMAIL,
      'Career Ka Dost portal: your password reset code',
      'Your password reset code for the Career Ka Dost staff portal is:\n\n' + code + '\n\nIt works for ' + RESET_MINUTES + ' minutes. ' +
        'If you did not ask for this, ignore this email: nothing has been changed.'
    )
    return true
  } catch (err) {
    cache.remove('reset_code')
    cache.remove('reset_cool')
    return false
  }
}

/** The owner types the emailed code and a new password. */
function forgotConfirm(req) {
  const cache = CacheService.getScriptCache()
  const raw = cache.get('reset_code')
  if (!raw) fail('The code has expired or was not requested. Please ask for a new code.')
  const rec = JSON.parse(raw)
  const next = String(req.next || '')
  const problem = passwordProblem(next)
  if (problem) fail(problem)

  if (!safeEqual(rec.hash, hashPassword(rec.salt, String(req.code || '').trim()))) {
    rec.tries = (rec.tries || 0) + 1
    if (rec.tries >= RESET_MAX_TRIES) {
      cache.remove('reset_code')
      fail('Too many wrong codes. Please ask for a new code.')
    }
    cache.put('reset_code', JSON.stringify(rec), Math.max(1, Math.floor((rec.exp - Date.now()) / 1000)))
    fail('That code is not correct. You can try ' + (RESET_MAX_TRIES - rec.tries) + ' more time(s).')
  }

  cache.remove('reset_code')
  const owner = ownerRecord()
  if (!owner) fail('The owner account was not found.')
  setPassword(owner.username, next, false)
  clearSessionsFor(owner.username)
  cache.remove('fail_' + owner.username)
  try {
    MailApp.sendEmail(OWNER_EMAIL, 'Career Ka Dost portal: password changed', 'The owner password for the Career Ka Dost staff portal was just changed at ' + nowStamp() + ' (India time). If this was not you, reset it again right away.')
  } catch (err) {
    // the password is already changed; the notice email is only a courtesy
  }
  return { ok: true }
}

function makeCode() {
  const n = parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 10), 16) % 1000000
  return ('000000' + n).slice(-6)
}

function maskEmail(email) {
  const parts = email.split('@')
  const name = parts[0]
  return name.charAt(0) + new Array(Math.max(1, name.length - 1)).join('*') + name.slice(-1) + '@' + parts[1]
}

/** Run this once from the editor: it asks Google for permission to send email, and sends you a test message. */
function testEmail() {
  MailApp.sendEmail(OWNER_EMAIL, 'Career Ka Dost portal: test email', 'If you can read this, the password reset emails will reach you.')
  Logger.log('Test email sent to ' + OWNER_EMAIL + '. Check that inbox (and Spam).')
}

function setPassword(username, password, mustChange) {
  const u = findStaff(username)
  if (!u) fail('Account not found.')
  const salt = newSalt()
  const sheet = sheetOf(STAFF_SHEET)
  sheet.getRange(u.row, 4, 1, 3).setValues([[salt, hashPassword(salt, password), mustChange]])
  staffMemo = null
}

function makeTempPassword() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const pick = function (set) { return set.charAt(Math.floor(Math.random() * set.length)) }
  let out = 'Ckd-'
  for (let i = 0; i < 4; i++) out += pick(letters)
  for (let j = 0; j < 4; j++) out += pick(digits)
  return out
}

function newSalt() {
  return Utilities.getUuid().replace(/-/g, '')
}

function hashPassword(salt, password) {
  let h = salt + ':' + password
  for (let i = 0; i < HASH_ROUNDS; i++) h = toHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + salt, Utilities.Charset.UTF_8))
  return h
}

function toHex(bytes) {
  return bytes.map(function (b) { return ((b < 0 ? b + 256 : b)).toString(16).padStart(2, '0') }).join('')
}

function safeEqual(a, b) {
  a = String(a)
  b = String(b)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ---------------------------------------------------------------------------------------------
// Staff list
// ---------------------------------------------------------------------------------------------

/**
 * Owner only: add a new employee. He chooses the username (it can never be changed afterwards). The first
 * password is always the username followed by @123, and the employee changes it at their first login.
 */
function addStaff(owner, req) {
  if (owner.role !== 'owner') fail('Only the owner can add employees.')
  const name = String(req.name || '').trim().replace(/\s+/g, ' ')
  const username = String(req.username || '').trim().toLowerCase()
  if (name.length < 2 || name.length > 60) fail('Please enter the employee name.')
  const problem = newUsernameProblem(username)
  if (problem) fail(problem)
  const password = username + '@123'
  const salt = newSalt()
  sheetOf(STAFF_SHEET).appendRow([username, name, 'employee', salt, hashPassword(salt, password), true, true, ''])
  staffMemo = null
  const out = bootstrap(owner)
  out.added = { username: username, name: name, password: password }
  return out
}

/** Owner only: discontinue (or bring back) an employee. Nothing is deleted: all their records stay. */
function setActive(owner, req) {
  if (owner.role !== 'owner') fail('Only the owner can do this.')
  const target = findStaff(String(req.username || '').toLowerCase())
  if (!target) fail('That staff member was not found.')
  if (target.role === 'owner') fail('The owner account cannot be discontinued.')
  const active = req.active === true
  sheetOf(STAFF_SHEET).getRange(target.row, 7).setValue(active)
  if (!active) clearSessionsFor(target.username)
  staffMemo = null
  return bootstrap(owner)
}

function sheetOf(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
  if (!sheet) fail('The portal is not set up yet. Run setupPortal first.')
  return sheet
}

function readStaff() {
  if (staffMemo) return staffMemo
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STAFF_SHEET)
  if (!sheet || sheet.getLastRow() < 2) return []
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, STAFF_HEADERS.length).getValues()
  staffMemo = rows
    .map(function (r, i) {
      return {
        row: i + 2,
        username: String(r[0]).toLowerCase(),
        name: String(r[1]),
        role: String(r[2]),
        salt: String(r[3]),
        hash: String(r[4]),
        mustChange: r[5] === true || String(r[5]).toLowerCase() === 'true',
        active: !(r[6] === false || String(r[6]).toLowerCase() === 'false'),
        lastLogin: r[7] instanceof Date ? Utilities.formatDate(r[7], TZ, 'yyyy-MM-dd HH:mm:ss') : String(r[7] || ''),
      }
    })
    .filter(function (s) { return s.username })
  return staffMemo
}

function findStaff(username) {
  const list = readStaff()
  for (let i = 0; i < list.length; i++) if (list[i].username === username) return list[i]
  return null
}

/** True until the person has chosen their own password (first login, or after a reset by the owner). */
function needsSetup(u) {
  return u.mustChange
}

function ownerRecord() {
  const list = readStaff()
  for (let i = 0; i < list.length; i++) if (list[i].role === 'owner') return list[i]
  return null
}

function publicUser(u) {
  return { username: u.username, name: u.name, role: u.role, mustChange: needsSetup(u) }
}

// ---------------------------------------------------------------------------------------------
// Time and attendance
// ---------------------------------------------------------------------------------------------

function nowParts() {
  const d = new Date()
  return { date: Utilities.formatDate(d, TZ, 'yyyy-MM-dd'), time: Utilities.formatDate(d, TZ, 'HH:mm:ss') }
}

function nowStamp() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss')
}

function minutesOf(time) {
  const p = String(time).split(':')
  return Number(p[0]) * 60 + Number(p[1])
}

function secondsOf(time) {
  const p = String(time).split(':')
  return Number(p[0]) * 3600 + Number(p[1]) * 60 + Number(p[2] || 0)
}

function hoursText(inTime, outTime) {
  const mins = Math.max(0, Math.round((secondsOf(outTime) - secondsOf(inTime)) / 60))
  return Math.floor(mins / 60) + 'h ' + ('0' + (mins % 60)).slice(-2) + 'm'
}

function readAttendance() {
  if (attendanceMemo) return attendanceMemo
  const sheet = sheetOf(ATTENDANCE_SHEET)
  if (sheet.getLastRow() < 2) return []
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, ATT_HEADERS.length).getValues()
  attendanceMemo = rows
    .map(function (r, i) {
      return {
        row: i + 2,
        date: String(r[0]),
        username: String(r[1]).toLowerCase(),
        name: String(r[2]),
        checkIn: String(r[3]),
        checkOut: String(r[4]),
        status: String(r[5]),
        hours: String(r[6]),
      }
    })
    .filter(function (r) { return r.date })
  return attendanceMemo
}

function findToday(username, date) {
  const rows = readAttendance()
  for (let i = 0; i < rows.length; i++) if (rows[i].username === username && rows[i].date === date) return rows[i]
  return null
}

function clean(r) {
  return r ? { date: r.date, username: r.username, name: r.name, checkIn: r.checkIn, checkOut: r.checkOut, status: r.status, hours: r.hours } : null
}

function monthRows(month) {
  return readAttendance()
    .filter(function (r) { return r.date.indexOf(month) === 0 })
    .sort(function (a, b) { return a.date === b.date ? (a.name < b.name ? -1 : 1) : a.date < b.date ? 1 : -1 })
}

/**
 * One reply with everything the portal screen needs: today's record, this month's rows, and for the
 * owner the whole team's status today. Login, check-in and check-out all answer with this, so the
 * website never has to make a second request.
 */
function bootstrap(user) {
  const t = nowParts()
  const month = t.date.slice(0, 7)
  const all = monthRows(month)
  const isOwner = user.role === 'owner'
  const out = {
    ok: true,
    user: publicUser(user),
    serverTime: t,
    month: month,
    today: clean(findToday(user.username, t.date)),
    rows: (isOwner ? all : all.filter(function (r) { return r.username === user.username })).map(clean),
    leaves: leavesFor(user, t.date.slice(0, 4)).map(cleanLeave),
    myReport: isOwner ? null : reportToday(user.username, t.date),
  }
  if (isOwner) {
    const todays = all.filter(function (r) { return r.date === t.date })
    out.pendingLeaves = readLeaves().filter(function (l) { return l.status === 'Pending' }).length
    out.staff = readStaff().map(function (s) {
      const rec = todays.filter(function (r) { return r.username === s.username })[0]
      return {
        username: s.username,
        name: s.name,
        role: s.role,
        active: s.active,
        lastLogin: s.lastLogin,
        mustChange: s.mustChange,
        today: clean(rec),
        leave: leaveToday(s.username, t.date),
        report: reportToday(s.username, t.date),
      }
    })
  }
  return out
}

function me(user) {
  return bootstrap(user)
}

function checkIn(user) {
  if (user.role === 'owner') fail('The owner does not need to check in.')
  const t = nowParts()
  if (findToday(user.username, t.date)) fail('You have already checked in today.')
  const status = minutesOf(t.time) >= LATE_FROM_MINUTES ? 'Late' : 'On time'
  const sheet = sheetOf(ATTENDANCE_SHEET)
  const row = sheet.getLastRow() + 1
  sheet.getRange(row, 1, 1, 5).setNumberFormat('@')
  sheet.getRange(row, 1, 1, ATT_HEADERS.length).setValues([[t.date, user.username, user.name, t.time, '', status, '']])
  attendanceMemo = null
  return bootstrap(user)
}

function checkOut(user) {
  if (user.role === 'owner') fail('The owner does not need to check out.')
  const t = nowParts()
  const rec = findToday(user.username, t.date)
  if (!rec) fail('Please check in first.')
  if (rec.checkOut) fail('You have already checked out today.')
  const sheet = sheetOf(ATTENDANCE_SHEET)
  sheet.getRange(rec.row, 5).setNumberFormat('@')
  sheet.getRange(rec.row, 5, 1, 3).setValues([[t.time, rec.status, hoursText(rec.checkIn, t.time)]])
  attendanceMemo = null
  return bootstrap(user)
}

/** Another month. Employees get their own rows; the owner gets everyone's (the page filters by person). */
function attendance(user, req) {
  const month = String(req.month || nowParts().date.slice(0, 7))
  let rows = monthRows(month)
  if (user.role !== 'owner') {
    rows = rows.filter(function (r) { return r.username === user.username })
  } else if (req.username) {
    const who = String(req.username).toLowerCase()
    rows = rows.filter(function (r) { return r.username === who })
  }
  return { ok: true, month: month, rows: rows.map(clean) }
}

// ---------------------------------------------------------------------------------------------
// Leave
// ---------------------------------------------------------------------------------------------

/** The Leaves tab is created the first time it is needed (or by setupPortal). */
function leavesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(LEAVE_SHEET)
  if (sheet) return sheet
  sheet = ss.insertSheet(LEAVE_SHEET)
  sheet.getRange(1, 1, 1, LEAVE_HEADERS.length).setValues([LEAVE_HEADERS])
  sheet.getRange(1, 1, 1, LEAVE_HEADERS.length).setFontWeight('bold').setBackground('#ffb81c')
  sheet.setFrozenRows(1)
  const range = sheet.getRange(2, 1, sheet.getMaxRows() - 1, LEAVE_HEADERS.length)
  range.setNumberFormat('@')
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$K2="Pending"').setBackground('#fff1c2').setFontColor('#7a5200').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$K2="Accepted"').setBackground('#d3f0d9').setFontColor('#0f6b2a').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$K2="Rejected"').setBackground('#f8c9c9').setFontColor('#a40000').setRanges([range]).build(),
  ])
  return sheet
}

function dayText(v) {
  return v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v)
}

function readLeaves() {
  if (leavesMemo) return leavesMemo
  const sheet = leavesSheet()
  if (sheet.getLastRow() < 2) {
    leavesMemo = []
    return leavesMemo
  }
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, LEAVE_HEADERS.length).getValues()
  leavesMemo = rows
    .map(function (r, i) {
      return {
        row: i + 2,
        id: String(r[0]),
        username: String(r[1]).toLowerCase(),
        name: String(r[2]),
        type: String(r[3]),
        half: String(r[4]),
        from: dayText(r[5]),
        to: dayText(r[6]),
        days: Number(r[7]) || 0,
        reason: String(r[8]),
        appliedOn: String(r[9]),
        status: String(r[10]),
        decidedBy: String(r[11]),
        decidedOn: String(r[12]),
      }
    })
    .filter(function (l) { return l.id })
  return leavesMemo
}

function cleanLeave(l) {
  return { id: l.id, username: l.username, name: l.name, type: l.type, half: l.half, from: l.from, to: l.to, days: l.days, reason: l.reason, appliedOn: l.appliedOn, status: l.status, decidedBy: l.decidedBy, decidedOn: l.decidedOn }
}

/** Employees get their own requests; the owner gets everyone's. This year's, plus anything still pending. */
function leavesFor(user, year) {
  return readLeaves()
    .filter(function (l) { return user.role === 'owner' || l.username === user.username })
    .filter(function (l) { return l.from.slice(0, 4) === year || l.status === 'Pending' })
    .sort(function (a, b) { return a.appliedOn < b.appliedOn ? 1 : a.appliedOn > b.appliedOn ? -1 : 0 })
}

/** Is this person on an accepted leave on that date? */
function leaveToday(username, date) {
  const list = readLeaves()
  for (let i = 0; i < list.length; i++) {
    const l = list[i]
    if (l.username === username && l.status === 'Accepted' && l.from <= date && date <= l.to) return { type: l.type, half: l.half }
  }
  return null
}

function dayNumber(iso) {
  const p = iso.split('-')
  return Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])) / 86400000
}

function isDate(v) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(dayNumber(v))
}

function applyLeave(user, req) {
  if (user.role === 'owner') fail('The owner does not need to apply for leave.')
  const half = String(req.type) === 'half'
  const today = nowParts().date
  const from = String(req.from || '')
  const to = half ? from : String(req.to || from)
  if (!isDate(from) || !isDate(to)) fail('Please choose the date from the calendar.')
  if (from < today) fail('Please choose today or a later date.')
  if (to < from) fail('The last date cannot be before the first date.')
  const days = half ? 0.5 : dayNumber(to) - dayNumber(from) + 1
  if (days > MAX_LEAVE_DAYS) fail('A leave request can be for at most ' + MAX_LEAVE_DAYS + ' days.')
  const part = String(req.half || '')
  if (half && part !== 'First half' && part !== 'Second half') fail('Please choose First half or Second half.')
  const reason = String(req.reason || '').trim()
  if (reason.length < 3) fail('Please write the reason for your leave.')
  if (reason.length > 500) fail('The reason is too long (500 letters at most).')

  const clash = readLeaves().filter(function (l) {
    if (l.username !== user.username || (l.status !== 'Pending' && l.status !== 'Accepted')) return false
    if (!(from <= l.to && to >= l.from)) return false
    // a first half and a second half on the same day do not clash
    const bothHalf = half && l.type === 'Half day' && l.from === from && l.half !== part
    return !bothHalf
  })
  if (clash.length) fail('You already have a leave request for these dates (' + clash[0].status + ').')

  const id = 'L' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase()
  const sheet = leavesSheet()
  const row = sheet.getLastRow() + 1
  sheet.getRange(row, 1, 1, LEAVE_HEADERS.length).setNumberFormat('@')
  sheet.getRange(row, 1, 1, LEAVE_HEADERS.length).setValues([[id, user.username, user.name, half ? 'Half day' : 'Full day', half ? part : '', from, to, days, reason, nowStamp(), 'Pending', '', '']])
  leavesMemo = null
  const out = bootstrap(user)
  out.applied = cleanLeave(readLeaves().filter(function (l) { return l.id === id })[0])
  return out
}

/** An employee withdraws their own request while it is still pending. */
function cancelLeave(user, req) {
  const l = readLeaves().filter(function (x) { return x.id === String(req.id || '') })[0]
  if (!l || l.username !== user.username) fail('That leave request was not found.')
  if (l.status !== 'Pending') fail('Only a pending request can be cancelled.')
  const sheet = leavesSheet()
  sheet.getRange(l.row, 11, 1, 3).setNumberFormat('@')
  sheet.getRange(l.row, 11, 1, 3).setValues([['Cancelled', user.name, nowStamp()]])
  leavesMemo = null
  return bootstrap(user)
}

/** Owner only: accept or reject a request (he can also change his mind later). */
function decideLeave(owner, req) {
  if (owner.role !== 'owner') fail('Only the owner can accept or reject leave.')
  const decision = String(req.decision || '')
  if (decision !== 'Accepted' && decision !== 'Rejected') fail('Choose Accepted or Rejected.')
  const l = readLeaves().filter(function (x) { return x.id === String(req.id || '') })[0]
  if (!l) fail('That leave request was not found.')
  if (l.status === 'Cancelled') fail('The employee cancelled this request.')
  const sheet = leavesSheet()
  sheet.getRange(l.row, 11, 1, 3).setNumberFormat('@')
  sheet.getRange(l.row, 11, 1, 3).setValues([[decision, owner.name, nowStamp()]])
  leavesMemo = null
  return bootstrap(owner)
}

// ---------------------------------------------------------------------------------------------
// Daily work report
// ---------------------------------------------------------------------------------------------

/** The DailyReports tab is created the first time it is needed (or by setupPortal). */
function reportsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(REPORT_SHEET)
  if (sheet) return sheet
  sheet = ss.insertSheet(REPORT_SHEET)
  sheet.getRange(1, 1, 1, REPORT_HEADERS.length).setValues([REPORT_HEADERS])
  sheet.getRange(1, 1, 1, REPORT_HEADERS.length).setFontWeight('bold').setBackground('#ffb81c')
  sheet.setFrozenRows(1)
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, 2).setNumberFormat('@')
  return sheet
}

function readReports() {
  if (reportsMemo) return reportsMemo
  const sheet = reportsSheet()
  if (sheet.getLastRow() < 2) {
    reportsMemo = []
    return reportsMemo
  }
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, REPORT_HEADERS.length).getValues()
  reportsMemo = rows
    .map(function (r, i) {
      return { row: i + 2, date: String(r[0]), username: String(r[1]).toLowerCase(), name: String(r[2]), text: String(r[3]), updatedOn: String(r[4]) }
    })
    .filter(function (r) { return r.date && r.username })
  return reportsMemo
}

function findReport(username, date) {
  const list = readReports()
  for (let i = 0; i < list.length; i++) if (list[i].username === username && list[i].date === date) return list[i]
  return null
}

function cleanReport(r) {
  return { date: r.date, username: r.username, name: r.name, text: r.text, updatedOn: r.updatedOn }
}

/** What this person wrote today, or null if they have not submitted anything yet. */
function reportToday(username, date) {
  const r = findReport(username, date)
  return r ? cleanReport(r) : null
}

/** An employee writes (or updates) today's report. One entry per person per day: submitting again replaces it. */
function submitReport(user, req) {
  if (user.role === 'owner') fail('The owner does not submit a daily report.')
  const text = String(req.text || '').trim()
  if (!text) fail('Please write what you worked on today.')
  if (text.length > MAX_REPORT_CHARS) fail('That is too long (' + MAX_REPORT_CHARS + ' letters at most).')
  const t = nowParts()
  const sheet = reportsSheet()
  const existing = findReport(user.username, t.date)
  if (existing) {
    sheet.getRange(existing.row, 4, 1, 2).setNumberFormat('@')
    sheet.getRange(existing.row, 4, 1, 2).setValues([[text, nowStamp()]])
  } else {
    const row = sheet.getLastRow() + 1
    sheet.getRange(row, 1, 1, REPORT_HEADERS.length).setNumberFormat('@')
    sheet.getRange(row, 1, 1, REPORT_HEADERS.length).setValues([[t.date, user.username, user.name, text, nowStamp()]])
  }
  reportsMemo = null
  return bootstrap(user)
}

/** Owner only: everyone's report for one date (defaults to today). */
function teamReports(owner, req) {
  if (owner.role !== 'owner') fail('Only the owner can see the team reports.')
  const date = String(req.date || nowParts().date)
  if (!isDate(date)) fail('Please choose a date.')
  const list = readReports()
    .filter(function (r) { return r.date === date })
    .map(cleanReport)
  return { ok: true, date: date, reports: list, staff: readStaff().filter(function (s) { return s.role !== 'owner' }).map(function (s) { return { username: s.username, name: s.name, active: s.active } }) }
}

// ---------------------------------------------------------------------------------------------
// Weekly summary email (owner's request, 24 Oct 2026)
// ---------------------------------------------------------------------------------------------

/** The 7 calendar days ending today (IST), oldest first, as 'yyyy-MM-dd' strings. */
function last7Days() {
  const t = nowParts()
  const out = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(t.date + 'T12:00:00+05:30')
    d.setUTCDate(d.getUTCDate() - i)
    out.push(Utilities.formatDate(d, TZ, 'yyyy-MM-dd'))
  }
  return out
}

/** Each active employee's attendance, leave and daily-report summary for the past 7 days, as plain text. */
function weeklySummaryText() {
  const days = last7Days()
  const from = days[0]
  const to = days[days.length - 1]
  const att = readAttendance().filter(function (r) { return r.date >= from && r.date <= to })
  const leaves = readLeaves().filter(function (l) { return l.status === 'Accepted' && l.from <= to && l.to >= from })
  const reports = readReports().filter(function (r) { return r.date >= from && r.date <= to })
  const staff = readStaff().filter(function (s) { return s.role !== 'owner' && s.active })

  const lines = ['Weekly team summary: ' + from + ' to ' + to, '']
  if (!staff.length) lines.push('No employees yet.')
  staff.forEach(function (s) {
    const mine = att.filter(function (r) { return r.username === s.username })
    const onTime = mine.filter(function (r) { return r.status === 'On time' }).length
    const late = mine.filter(function (r) { return r.status === 'Late' }).length
    const leaveDays = leaves.filter(function (l) { return l.username === s.username }).reduce(function (sum, l) { return sum + l.days }, 0)
    const mineReports = reports
      .filter(function (r) { return r.username === s.username })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0 })
    lines.push(s.name + ' (' + s.username + ')')
    lines.push('  Present: ' + mine.length + ' day(s) - ' + onTime + ' on time, ' + late + ' late')
    lines.push('  Leave: ' + leaveDays + ' day(s)')
    lines.push('  Daily reports: ' + mineReports.length + ' of 7 days')
    mineReports.forEach(function (r) { lines.push('    ' + r.date + ': ' + r.text) })
    lines.push('')
  })
  return lines.join('\n')
}

/** Emails the weekly summary to the owner. Runs automatically every Saturday - see installWeeklySummaryTrigger. */
function sendWeeklySummary() {
  const days = last7Days()
  MailApp.sendEmail(OWNER_EMAIL, 'Career Ka Dost - Weekly team summary (' + days[0] + ' to ' + days[6] + ')', weeklySummaryText())
}

/**
 * Run this ONCE from the Apps Script editor to turn the weekly email on. Safe to re-run (it removes any
 * trigger it made before, so running it again never sends two emails). First check the project's time zone
 * is India - Project Settings (gear icon) > General settings > Time zone - otherwise "Saturday 11:59" will
 * not mean 11:59 IST. Apps Script time-based triggers are not exact to the minute (usually within about
 * 15 minutes of the time asked).
 */
function installWeeklySummaryTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendWeeklySummary') ScriptApp.deleteTrigger(t)
  })
  ScriptApp.newTrigger('sendWeeklySummary').timeBased().onWeekDay(ScriptApp.WeekDay.SATURDAY).atHour(11).nearMinute(59).create()
  Logger.log('Weekly summary email turned on: every Saturday, sent to ' + OWNER_EMAIL + '.')
}

// ---------------------------------------------------------------------------------------------
// Bill / invoice generator (29 Oct 2026)
// ---------------------------------------------------------------------------------------------

function invoicesSheet() {
  return getOrCreateSheet(SpreadsheetApp.getActiveSpreadsheet(), INVOICE_SHEET, INVOICE_HEADERS)
}

/** Rounds to paise (2 decimal places) so money never shows long floating-point tails. */
function round2_(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

/** CKD-0001, CKD-0002, ... One shared counter, kept outside the sheet so it is correct even if old rows are
 * ever deleted. Only called while createInvoice holds the script lock, so two staff members saving at the
 * same moment can never be given the same number. */
function nextInvoiceNumber_() {
  const props = PropertiesService.getScriptProperties()
  const seq = Number(props.getProperty('invoiceSeq') || '0') + 1
  props.setProperty('invoiceSeq', String(seq))
  return INVOICE_PREFIX + '-' + ('0000' + seq).slice(-4)
}

/**
 * Any logged-in staff member (owner or employee) can create a bill. The server recomputes every number
 * itself from the raw services/discount sent - it never just trusts a total typed in the browser -
 * then logs the finished invoice as a new row and hands back the same numbers to print immediately.
 */
function createInvoice(user, req) {
  const studentName = String(req.studentName || '').trim()
  const phone = String(req.phone || '').trim()
  if (!studentName) fail('Please enter the student name.')
  if (!phone) fail('Please enter a phone number.')

  const itemsIn = Array.isArray(req.items) ? req.items : []
  if (!itemsIn.length) fail('Please add at least one service.')
  if (itemsIn.length > MAX_INVOICE_ITEMS) fail('Too many services on one bill.')
  const items = itemsIn.map(function (it) {
    const name = String((it && it.name) || '').trim()
    const price = Number(it && it.price)
    if (!name) fail('Each service needs a name.')
    if (!isFinite(price) || price < 0) fail('Each service needs a valid price.')
    return { name: name, price: round2_(price) }
  })
  const subtotal = round2_(items.reduce(function (sum, it) { return sum + it.price }, 0))

  // Discount: the browser keeps a percent box and a rupee box in sync as the person types in either one.
  // Whichever one they actually typed last (discountMode) is the number the server trusts; the other is
  // always recalculated here, so a stale pair sent by mistake can never produce a wrong total.
  let discountAmount
  let discountPercent
  if (String(req.discountMode) === 'amount') {
    discountAmount = round2_(Number(req.discountAmount))
    if (!isFinite(discountAmount) || discountAmount < 0) fail('Please enter a valid discount amount.')
    if (discountAmount > subtotal) fail('Discount cannot be more than the subtotal.')
    discountPercent = subtotal > 0 ? round2_((discountAmount / subtotal) * 100) : 0
  } else {
    discountPercent = Number(req.discountPercent)
    if (!isFinite(discountPercent) || discountPercent < 0) discountPercent = 0
    if (discountPercent > 100) fail('Discount cannot be more than 100%.')
    discountAmount = round2_((subtotal * discountPercent) / 100)
  }
  // No GST: Career Ka Dost is not GST-registered, so the taxable amount is simply the total.
  const total = round2_(subtotal - discountAmount)

  const paymentMode = String(req.paymentMode || 'Cash').trim() || 'Cash'
  const paymentStatus = String(req.paymentStatus || 'Paid in full').trim() || 'Paid in full'
  let amountPaid = total
  let balanceDue = 0
  if (paymentStatus === 'Partially paid') {
    amountPaid = round2_(Number(req.amountPaid))
    if (!isFinite(amountPaid) || amountPaid < 0) fail('Please enter a valid amount paid.')
    if (amountPaid > total) amountPaid = total
    balanceDue = round2_(total - amountPaid)
  }

  const classOrCourse = String(req.classOrCourse || '').trim()
  const city = String(req.city || '').trim()
  const notes = String(req.notes || '').trim()

  const t = nowParts()
  const invoiceNo = nextInvoiceNumber_()
  const sheet = invoicesSheet()
  const row = sheet.getLastRow() + 1
  const servicesText = items.map(function (it) { return it.name + ' (Rs ' + it.price + ')' }).join('; ')
  sheet.getRange(row, 1, 1, INVOICE_HEADERS.length).setNumberFormat('@')
  sheet.getRange(row, 1, 1, INVOICE_HEADERS.length).setValues([[
    invoiceNo, t.date, t.time, user.username, user.name,
    studentName, phone, classOrCourse, city,
    servicesText, subtotal, discountPercent, discountAmount, total,
    paymentMode, paymentStatus, amountPaid, balanceDue, notes,
  ]])

  return {
    ok: true,
    invoice: {
      invoiceNo: invoiceNo,
      date: t.date,
      time: t.time,
      createdByUsername: user.username,
      createdByName: user.name,
      studentName: studentName,
      phone: phone,
      classOrCourse: classOrCourse,
      city: city,
      items: items,
      subtotal: subtotal,
      discountPercent: discountPercent,
      discountAmount: discountAmount,
      total: total,
      paymentMode: paymentMode,
      paymentStatus: paymentStatus,
      amountPaid: amountPaid,
      balanceDue: balanceDue,
      notes: notes,
    },
  }
}

function readInvoices_() {
  const sheet = invoicesSheet()
  if (sheet.getLastRow() < 2) return []
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, INVOICE_HEADERS.length).getValues()
  return rows
    .map(function (r) {
      return {
        invoiceNo: String(r[0]),
        date: String(r[1]),
        time: String(r[2]),
        createdByUsername: String(r[3]),
        createdByName: String(r[4]),
        studentName: String(r[5]),
        phone: String(r[6]),
        classOrCourse: String(r[7]),
        city: String(r[8]),
        services: String(r[9]),
        subtotal: Number(r[10]),
        discountPercent: Number(r[11]),
        discountAmount: Number(r[12]),
        total: Number(r[13]),
        paymentMode: String(r[14]),
        paymentStatus: String(r[15]),
        amountPaid: Number(r[16]),
        balanceDue: Number(r[17]),
        notes: String(r[18]),
      }
    })
    .filter(function (r) { return r.invoiceNo })
}

/** The owner sees every invoice. An employee sees only the ones they personally created (to reprint, say). */
function listInvoices(user) {
  const all = readInvoices_().reverse()
  const mine = user.role === 'owner' ? all : all.filter(function (r) { return r.createdByUsername === user.username })
  return { ok: true, invoices: mine, isOwner: user.role === 'owner' }
}
