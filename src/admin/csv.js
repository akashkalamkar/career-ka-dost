/**
 * Downloads a table as a .csv file that opens straight in Excel. The invisible BOM at the start tells
 * Excel the file is UTF-8, so names and the ₹ sign show correctly instead of odd characters.
 */
export function downloadCsv(filename, head, rows) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const text = '﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
