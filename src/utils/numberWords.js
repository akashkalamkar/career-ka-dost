/** Turns a rupee amount into words, Indian numbering (lakh/crore), for the "Amount in words" line on a bill. */
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function threeDigits(n) {
  const parts = []
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)] + ' Hundred')
    n %= 100
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''))
  } else if (n > 0) {
    parts.push(ONES[n])
  }
  return parts.join(' ')
}

/** 123456789 -> "Twelve Crore ... " style, Indian grouping (crore / lakh / thousand / hundred). */
function wholeNumberToWords(n) {
  if (n === 0) return 'Zero'
  const crore = Math.floor(n / 10000000)
  n %= 10000000
  const lakh = Math.floor(n / 100000)
  n %= 100000
  const thousand = Math.floor(n / 1000)
  n %= 1000
  const hundred = n

  const parts = []
  if (crore) parts.push(threeDigits(crore) + ' Crore')
  if (lakh) parts.push(threeDigits(lakh) + ' Lakh')
  if (thousand) parts.push(threeDigits(thousand) + ' Thousand')
  if (hundred) parts.push(threeDigits(hundred))
  return parts.join(' ')
}

/** 4950 -> "Rupees Four Thousand Nine Hundred Fifty Only". 4950.50 -> "...Fifty and Fifty Paise Only". */
export function amountInWords(amount) {
  const n = Math.max(0, Number(amount) || 0)
  const rupees = Math.floor(n)
  const paise = Math.round((n - rupees) * 100)
  let text = 'Rupees ' + wholeNumberToWords(rupees)
  if (paise > 0) text += ' and ' + wholeNumberToWords(paise) + ' Paise'
  return text + ' Only'
}
