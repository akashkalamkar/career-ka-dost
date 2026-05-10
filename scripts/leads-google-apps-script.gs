/**
 * Google Apps Script — stores lead form POSTs in the first sheet tab.
 *
 * OPTION B (standalone): set SHEET_ID to the ID from:
 *   https://docs.google.com/spreadsheets/d/PASTE_ONLY_FROM_HERE/edit
 * Never use script project / library / deployment IDs.
 *
 * Deploy Web app: Execute as Me, Who has access = Anyone
 * Copy /exec URL → VITE_LEADS_WEBHOOK_URL in .env
 */

/** Paste the spreadsheet ID from: .../spreadsheets/d/<THIS_ID_IS_HERE>/edit — required for Web App POST. */
var SHEET_ID = ''

/** Optional: exact tab name (e.g. Sheet1). Leave blank to use the leftmost tab. */
var SHEET_TAB_NAME = ''

function getLeadSheet() {
  var id = String(SHEET_ID || '').trim()
  if (!id || id.length < 20) {
    throw new Error(
      'SHEET_ID is missing. Copy only the ID from your Sheet URL (between /d/ and /edit). ' +
        'A standalone Web App cannot use getActiveSpreadsheet() — there is no active sheet during HTTP POST.',
    )
  }
  var ss = SpreadsheetApp.openById(id)
  var tab = String(SHEET_TAB_NAME || '').trim()
  if (tab) {
    var named = ss.getSheetByName(tab)
    if (!named) {
      throw new Error('No tab named "' + tab + '". Create it or fix SHEET_TAB_NAME.')
    }
    return named
  }
  return ss.getSheets()[0]
}

/** Merge e.parameter (often empty for cross-origin POST) with raw post body. */
function parseLeadParams_(e) {
  var p = {}
  var key
  if (e.parameter) {
    for (key in e.parameter) {
      if (Object.prototype.hasOwnProperty.call(e.parameter, key)) {
        p[key] = e.parameter[key]
      }
    }
  }
  var hasKeys = false
  for (key in p) {
    hasKeys = true
    break
  }
  if (hasKeys) {
    return p
  }
  if (!e.postData || !e.postData.contents) {
    return {}
  }
  var raw = String(e.postData.contents)
  var parts = raw.split('&')
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i]
    if (!pair) {
      continue
    }
    var eq = pair.indexOf('=')
    var k = eq === -1 ? pair : pair.substring(0, eq)
    var v = eq === -1 ? '' : pair.substring(eq + 1)
    k = decodeURIComponent(k.replace(/\+/g, ' '))
    v = decodeURIComponent(v.replace(/\+/g, ' '))
    p[k] = v
  }
  return p
}

function doGet() {
  return ContentService.createTextOutput('Career Ka Dost leads endpoint is deployed. Submissions use POST from the website.')
    .setMimeType(ContentService.MimeType.TEXT)
}

function doPost(e) {
  try {
    var sheet = getLeadSheet()
    var p = parseLeadParams_(e)
    sheet.appendRow([
      new Date(),
      String(p.source || ''),
      String(p.studentName || ''),
      String(p.phone || ''),
      String(p.email || ''),
      String(p.classExam || ''),
      String(p.city || ''),
      String(p.submittedAt || ''),
    ])
    var workbook = sheet.getParent()
    console.log(
      'Lead row appended url=' +
        workbook.getUrl() +
        ' tab=' +
        sheet.getName() +
        ' lastRow=' +
        sheet.getLastRow(),
    )
    return HtmlService.createHtmlOutput('<html><body>OK</body></html>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  } catch (err) {
    console.error('doPost error (sheet row was NOT written): ' + String(err))
    if (err && err.stack) {
      console.error(String(err.stack))
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(
      ContentService.MimeType.JSON,
    )
  }
}
