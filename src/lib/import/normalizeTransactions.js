const MONTHS = { jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11 };

export function parseStatementDate(value, format = 'auto') {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  let match = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T].*)?$/);
  if (match) return validDate(+match[1], +match[2], +match[3]);
  match = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})(?:[ T].*)?$/);
  if (match) {
    let a = +match[1], b = +match[2], year = +match[3];
    if (year < 100) year += year >= 70 ? 1900 : 2000;
    let month, day;
    if (format === 'DMY' || (format === 'auto' && a > 12 && b <= 12)) { day = a; month = b; }
    else if (format === 'MDY' || (format === 'auto' && b > 12 && a <= 12)) { month = a; day = b; }
    else if (a > 12 && b > 12) return null;
    else { month = a; day = b; }
    return validDate(year, month, day);
  }
  match = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (match) {
    const month = MONTHS[match[2].toLowerCase()];
    if (month == null) return null;
    return validDate(+match[3], month + 1, +match[1]);
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function validDate(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseStatementAmount(value) {
  if (value == null || String(value).trim() === '') return null;
  let raw = String(value).trim();
  const negative = /^\(.*\)$/.test(raw) || /-\s*[\d.,]/.test(raw) || /\bDR\b/i.test(raw);
  raw = raw.replace(/[₱$€£¥₹\s]/g, '').replace(/[()]/g, '').replace(/\b(?:PHP|USD|EUR|GBP|DR|CR)\b/gi, '');
  if (!/^[+-]?[\d.,]+$/.test(raw)) return null;
  const comma = raw.lastIndexOf(',');
  const dot = raw.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) {
    if (comma > dot) raw = raw.replace(/\./g, '').replace(',', '.');
    else raw = raw.replace(/,/g, '');
  } else if (comma >= 0) {
    const decimals = raw.length - comma - 1;
    if (decimals === 1 || decimals === 2) raw = raw.replace(',', '.');
    else raw = raw.replace(/,/g, '');
  }
  if ((raw.match(/\./g) || []).length > 1 || !/^[+-]?\d+(?:\.\d{1,4})?$/.test(raw)) return null;
  const amount = Math.abs(Number(raw));
  if (!Number.isFinite(amount)) return null;
  return negative ? -amount : amount;
}

export function cleanMerchantName(value) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\b(?:REF|REFERENCE|TRACE|RRN|TXN|TRANSACTION|AUTH)[\s:#-]*[A-Z0-9-]{5,}\b/gi, '')
    .replace(/\b\d{8,}\b/g, '')
    .replace(/\s+[|*-]+\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s*|:;-]+|[\s*|:;-]+$/g, '')
    .trim();
}

function getCell(row, index) { return index === '' || index == null ? '' : String(row?.[Number(index)] ?? '').trim(); }
function directionFromType(value) {
  const text = String(value ?? '').toLowerCase();
  if (/\b(debit|withdraw|purchase|payment|charge|sent|transfer out|dr)\b/.test(text)) return 'expense';
  if (/\b(credit|deposit|refund|received|transfer in|cr)\b/.test(text)) return 'income';
  return null;
}

export function normalizeTransactions({ rows, mapping, dateFormat = 'auto', defaultCurrency = 'PHP' }) {
  const transactions = [];
  const rejected = [];
  const warnings = [];
  const seen = new Set();
  let duplicateCount = 0;

  rows.forEach((row, index) => {
    const rawDate = getCell(row, mapping.date);
    const rawDescription = getCell(row, mapping.description);
    const rawAmount = mapping.amount ? getCell(row, mapping.amount) : '';
    const rawDebit = mapping.debit ? getCell(row, mapping.debit) : '';
    const rawCredit = mapping.credit ? getCell(row, mapping.credit) : '';
    const rawType = getCell(row, mapping.type);
    const date = parseStatementDate(rawDate, dateFormat);
    const merchant = cleanMerchantName(rawDescription);
    let amount = null;
    let direction = directionFromType(rawType);
    const rowWarnings = [];

    if (mapping.amount) {
      amount = parseStatementAmount(rawAmount);
      if (amount != null && amount < 0) direction = direction || 'expense';
      amount = amount == null ? null : Math.abs(amount);
    } else {
      const debit = rawDebit === '' ? 0 : parseStatementAmount(rawDebit);
      const credit = rawCredit === '' ? 0 : parseStatementAmount(rawCredit);
      if ((rawDebit !== '' && debit == null) || (rawCredit !== '' && credit == null)) amount = null;
      else if (rawDebit !== '' && rawCredit !== '') {
        if (Math.abs(debit) > 0 && Math.abs(credit) > 0) rowWarnings.push('Both debit and credit contain values.');
        else if (Math.abs(debit) > 0) { amount = Math.abs(debit); direction = 'expense'; }
        else if (Math.abs(credit) > 0) { amount = Math.abs(credit); direction = 'income'; }
        else amount = 0;
      } else if (rawDebit !== '') { amount = Math.abs(debit); direction = 'expense'; }
      else if (rawCredit !== '') { amount = Math.abs(credit); direction = 'income'; }
    }

    if (!date) rowWarnings.push('Date could not be recognized.');
    if (!merchant) rowWarnings.push('Description is missing.');
    if (amount == null) rowWarnings.push('Amount is missing or invalid.');
    if (rowWarnings.some(item => item === 'Both debit and credit contain values.')) {
      rejected.push({ rowNumber: index + 1, rawDate, rawDescription, rawAmount: rawAmount || `${rawDebit} / ${rawCredit}`, reasons: rowWarnings });
      return;
    }
    if (!date || !merchant || amount == null) {
      rejected.push({ rowNumber: index + 1, rawDate, rawDescription, rawAmount: rawAmount || `${rawDebit} / ${rawCredit}`, reasons: rowWarnings });
      return;
    }

    const currency = getCell(row, mapping.currency).toUpperCase() || defaultCurrency;
    const reference = getCell(row, mapping.reference);
    const balanceValue = getCell(row, mapping.balance);
    const balance = balanceValue ? parseStatementAmount(balanceValue) : null;
    const duplicateKey = [date, merchant.toLowerCase(), amount.toFixed(2), currency].join('|');
    const duplicate = seen.has(duplicateKey);
    if (duplicate) duplicateCount += 1;
    else seen.add(duplicateKey);

    if (date > new Date().toISOString().slice(0, 10)) rowWarnings.push('Transaction date is in the future.');
    if (amount === 0) rowWarnings.push('Amount is zero.');
    if (!direction) rowWarnings.push('Could not determine whether this is money in or money out.');

    transactions.push({
      id: `tx-${index + 1}`, sourceRow: index + 1, date, merchant, originalDescription: rawDescription,
      amount, direction: direction || 'unknown', currency, reference: reference || null,
      balance, duplicate, included: !duplicate, warnings: rowWarnings
    });
  });

  if (duplicateCount) warnings.push(`${duplicateCount} exact duplicate transaction${duplicateCount === 1 ? ' was' : 's were'} detected and excluded from the cleaned set.`);
  if (rejected.length) warnings.push(`${rejected.length} row${rejected.length === 1 ? '' : 's'} could not be normalized and need review.`);
  const cleanTransactions = transactions.filter(item => item.included);
  return {
    transactions,
    rejected,
    warnings,
    duplicateCount,
    includedCount: cleanTransactions.length,
    expenseCount: cleanTransactions.filter(item => item.direction === 'expense').length,
    incomeCount: cleanTransactions.filter(item => item.direction === 'income').length,
    unknownDirectionCount: cleanTransactions.filter(item => item.direction === 'unknown').length,
    totalRows: rows.length
  };
}
