/**
 * Career Ka Dost - website leads -> Google Sheet.
 *
 * Saves every booking-form submission as a new row in its OWN tab ("Website Leads") of your
 * spreadsheet. Your other tabs are never touched.
 *
 * Each row gets:
 *   - Date and Time (India time) added automatically at the moment the form is submitted
 *   - Status dropdown, starting as "New lead":  New lead (red) / Contacted (orange) / Converted (green)
 *
 * SETUP (once):
 *   1. Open the spreadsheet > Extensions > Apps Script. Delete any code there and paste this whole file.
 *   2. Press Save, choose the function "setupLeadSheet" in the toolbar and press Run.
 *      Approve the permission prompts. The "Website Leads" tab is created and formatted.
 *   3. Deploy > New deployment > type "Web app".
 *        Execute as: Me      Who has access: Anyone
 *      Press Deploy and copy the Web app URL (it ends in /exec).
 *   4. Put that URL in the website's .env file:   VITE_LEADS_WEBHOOK_URL=<the /exec URL>
 *
 * If you change this code later: Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy.
 */

/** The spreadsheet (the long ID between /d/ and /edit in its address). */
var SHEET_ID = '1m6kIR7u35YsRbkjlnhUkzsfxU31JjM9utZBdJwJq4uY'

/**
 * The ONE tab where all website leads are kept. New leads are added at the top (just under the
 * headings) and older leads move down.
 *
 * Easiest and safest: set TAB_GID to the number after "gid=" in the address bar while that tab is open
 * (for example 1836378121). It keeps working even if you rename the tab.
 * Otherwise the tab is found by TAB_NAME. A new tab is only ever created if neither can be found.
 */
var TAB_GID = '564401502'
var TAB_NAME = 'Website Leads'

/** All dates and times are written in India time. */
var TIME_ZONE = 'Asia/Kolkata'

/** Shown when you open the web app address in a browser, so you can tell which version is live. */
var SCRIPT_VERSION = 'v5 - columns saved by heading name, 4 statuses'

/** Column order. Column C is the status dropdown. */
var HEADERS = ['Date', 'Time', 'Status', 'Student name', 'Phone', 'Email', 'Class / Exam', 'School name', 'City', 'Concern', 'Source', 'Notes']

var STATUS_COL = 3
var STATUS_NEW = 'New lead'
var STATUS_CONTACTED = 'Contacted'
var STATUS_CONVERTED = 'Converted'
var STATUS_DEAD = 'Dead lead'

/** Rows reserved for the dropdown and colours (they also get applied to each new row). */
var RESERVED_ROWS = 5000

function openLeadSheet_() {
  var id = String(SHEET_ID || '').trim()
  if (!id || id.length < 20) {
    throw new Error('SHEET_ID is missing. Paste the ID from your Sheet address (between /d/ and /edit).')
  }
  var ss = SpreadsheetApp.openById(id)
  var sheet = findLeadTab_(ss)
  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME)
  }
  // A brand-new (or empty) tab gets its headers and formatting. A set-up tab is left as it is.
  if (sheet.getLastRow() === 0) {
    formatLeadSheet_(sheet)
  }
  return sheet
}

/** Finds the lead tab by its gid first (survives renaming), then by name. */
function findLeadTab_(ss) {
  var gid = String(TAB_GID || '').trim()
  if (gid) {
    var all = ss.getSheets()
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].getSheetId()) === gid) {
        return all[i]
      }
    }
    throw new Error('No tab with gid ' + gid + '. Check TAB_GID (the number after gid= in the address bar).')
  }
  return ss.getSheetByName(TAB_NAME)
}

function statusRule_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList([STATUS_NEW, STATUS_CONTACTED, STATUS_CONVERTED, STATUS_DEAD], true)
    .setAllowInvalid(false)
    .setHelpText('Choose: New lead, Contacted, Converted or Dead lead')
    .build()
}

function formatLeadSheet_(sheet) {
  // Make sure there are enough rows for the dropdown and colours.
  var have = sheet.getMaxRows()
  if (have < RESERVED_ROWS) {
    sheet.insertRowsAfter(have, RESERVED_ROWS - have)
  }
  var cols = HEADERS.length
  if (sheet.getMaxColumns() < cols) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), cols - sheet.getMaxColumns())
  }

  // Headings
  var head = sheet.getRange(1, 1, 1, cols)
  head.setValues([HEADERS])
  head.setBackground('#1b1b1b').setFontColor('#ffb81c').setFontWeight('bold').setFontSize(11)
  head.setVerticalAlignment('middle').setHorizontalAlignment('left')
  sheet.setRowHeight(1, 34)
  sheet.setFrozenRows(1)

  // Phone numbers and dates are kept as plain text so nothing gets reformatted.
  sheet.getRange(2, 1, RESERVED_ROWS - 1, 2).setNumberFormat('@')
  sheet.getRange(2, 5, RESERVED_ROWS - 1, 1).setNumberFormat('@')

  // Column widths
  var widths = [110, 100, 120, 190, 130, 230, 170, 230, 130, 320, 150, 260]
  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i])
  }
  sheet.getRange(2, 1, RESERVED_ROWS - 1, cols).setVerticalAlignment('middle')

  // Status dropdown for every row
  var statusRange = sheet.getRange(2, STATUS_COL, RESERVED_ROWS - 1, 1)
  statusRange.setDataValidation(statusRule_())
  statusRange.setFontWeight('bold').setHorizontalAlignment('center')

  // Colours: red / orange / green
  var rules = [
    colourRule_(statusRange, STATUS_NEW, '#e53935'),
    colourRule_(statusRange, STATUS_CONTACTED, '#fb8c00'),
    colourRule_(statusRange, STATUS_CONVERTED, '#2e9e4f'),
    colourRule_(statusRange, STATUS_DEAD, '#1b1b1b', '#ffb81c'), // black cell, golden-yellow text
  ]
  sheet.setConditionalFormatRules(rules)
}

function colourRule_(range, text, colour, textColour) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(text)
    .setBackground(colour)
    .setFontColor(textColour || '#ffffff')
    .setRanges([range])
    .build()
}

/** Run this once from the editor (see SETUP). It creates and formats the tab, and is safe to run again. */
function setupLeadSheet() {
  var id = String(SHEET_ID || '').trim()
  var ss = SpreadsheetApp.openById(id)
  var sheet = findLeadTab_(ss) || ss.insertSheet(TAB_NAME)
  formatLeadSheet_(sheet)
  console.log('Ready: tab "' + sheet.getName() + '" in ' + ss.getUrl())
}

/** Merge e.parameter (often empty for cross-origin POST) with the raw post body. */
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
  var parts = String(e.postData.contents).split('&')
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i]
    if (!pair) {
      continue
    }
    var eq = pair.indexOf('=')
    var k = eq === -1 ? pair : pair.substring(0, eq)
    var v = eq === -1 ? '' : pair.substring(eq + 1)
    p[decodeURIComponent(k.replace(/\+/g, ' '))] = decodeURIComponent(v.replace(/\+/g, ' '))
  }
  return p
}

/**
 * One-time repair: if some older rows have the source ("Welcome pop-up" / "Contact page form") in the Concern
 * column and an empty Source column, this moves it to the right place. Run it once from the editor.
 */
function repairSourceColumn() {
  var sheet = openLeadSheet_()
  var lastRow = sheet.getLastRow()
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS.length)
  var headings = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
    return String(h).trim()
  })
  var c = headings.indexOf('Concern')
  var s = headings.indexOf('Source')
  if (c < 0 || s < 0 || lastRow < 2) {
    console.log('Nothing to repair.')
    return
  }
  var range = sheet.getRange(2, 1, lastRow - 1, lastCol)
  var values = range.getValues()
  var moved = 0
  for (var i = 0; i < values.length; i++) {
    var concern = String(values[i][c] || '')
    if ((concern === 'Welcome pop-up' || concern === 'Contact page form') && !String(values[i][s] || '')) {
      values[i][s] = concern
      values[i][c] = ''
      moved++
    }
  }
  range.setValues(values)
  console.log('Repaired ' + moved + ' row(s).')
}
function sourceLabel_(source) {
  if (source === 'lead-modal') {
    return 'Welcome pop-up'
  }
  if (source === 'lead-form') {
    return 'Contact page form'
  }
  return String(source || '')
}

function doGet() {
  return ContentService.createTextOutput('Career Ka Dost leads endpoint ' + SCRIPT_VERSION + ' is deployed. Submissions use POST from the website.').setMimeType(
    ContentService.MimeType.TEXT,
  )
}

function doPost(e) {
  var lock = LockService.getScriptLock()
  try {
    // Two people submitting at the same moment must not overwrite each other's row.
    lock.waitLock(20000)
    var sheet = openLeadSheet_()
    var p = parseLeadParams_(e)
    var now = new Date()

    // Newest lead goes in row 2, directly under the headings; older leads move down.
    var row = 2
    sheet.insertRowBefore(row)

    // Every value is written under the heading with the SAME NAME, so the order of the columns
    // can never mix the details up (even if a column is added or moved in the sheet).
    var lastCol = Math.max(sheet.getLastColumn(), HEADERS.length)
    var headings = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
      return String(h).trim()
    })
    try {
      var below = sheet.getRange(row + 1, 1, 1, lastCol)
      var fresh = sheet.getRange(row, 1, 1, lastCol)
      below.copyTo(fresh, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false)
      below.copyTo(fresh, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false)
    } catch (ignore) {
      /* the dropdown is set again below */
    }
    var data = {
      'Date': Utilities.formatDate(now, TIME_ZONE, 'dd MMM yyyy'),
      'Time': Utilities.formatDate(now, TIME_ZONE, 'hh:mm:ss a'),
      'Status': STATUS_NEW,
      'Student name': String(p.studentName || ''),
      'Phone': String(p.phone || ''),
      'Email': String(p.email || ''),
      'Class / Exam': String(p.classExam || ''),
      'School name': String(p.schoolName || ''),
      'City': String(p.city || ''),
      'Concern': String(p.concern || ''),
      'Source': sourceLabel_(p.source),
      'Notes': '',
    }
    var values = headings.map(function (h) {
      return Object.prototype.hasOwnProperty.call(data, h) ? data[h] : ''
    })
    sheet.getRange(row, 1, 1, lastCol).setNumberFormat('@')
    sheet.getRange(row, 1, 1, lastCol).setValues([values])
    // Make sure this row has the dropdown (all four options), the bold centred status and the colour rules.
    var statusCol = headings.indexOf('Status') + 1 || STATUS_COL
    sheet.getRange(row, statusCol).setDataValidation(statusRule_()).setFontWeight('bold').setHorizontalAlignment('center')

    console.log('Lead saved at the top (row 2) of "' + sheet.getName() + '"')
    return HtmlService.createHtmlOutput('<html><body>OK</body></html>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  } catch (err) {
    console.error('doPost error (lead was NOT saved): ' + String(err))
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON)
  } finally {
    try {
      lock.releaseLock()
    } catch (ignore) {
      /* lock was never acquired */
    }
  }
}
