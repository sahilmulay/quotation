// Indian Currency & Number Formatting Helpers

export function formatCurrency(amount: number, includeSymbol = false): string {
  if (isNaN(amount)) return includeSymbol ? '₹ 0.00' : '0.00';
  
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return includeSymbol ? `₹ ${formatted}` : formatted;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (day && month && year) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function numberToWordsIndian(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    let str = '';
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    } else {
      str += a[n];
    }
    return str;
  }

  const integerPart = Math.floor(Math.abs(num));
  const decimalPart = Math.round((Math.abs(num) - integerPart) * 100);

  let crores = Math.floor(integerPart / 10000000);
  let lakhs = Math.floor((integerPart % 10000000) / 100000);
  let thousands = Math.floor((integerPart % 100000) / 1000);
  let hundreds = Math.floor((integerPart % 1000) / 100);
  let remaining = integerPart % 100;

  let words = '';
  if (crores > 0) words += inWords(crores) + ' Crore ';
  if (lakhs > 0) words += inWords(lakhs) + ' Lakh ';
  if (thousands > 0) words += inWords(thousands) + ' Thousand ';
  if (hundreds > 0) words += inWords(hundreds) + ' Hundred ';
  if (remaining > 0) {
    if (words !== '') words += 'and ';
    words += inWords(remaining) + ' ';
  }

  words = words.trim() + ' Rupees';

  if (decimalPart > 0) {
    words += ' and ' + inWords(decimalPart) + ' Paise';
  }

  return words + ' Only';
}
