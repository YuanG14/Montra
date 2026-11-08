const FIELD_ALIASES = {
  date: ['date', 'transaction date', 'trans date', 'posting date', 'posted date', 'value date', 'timestamp', 'datetime'],
  description: ['description', 'details', 'transaction details', 'merchant', 'merchant name', 'payee', 'narration', 'particulars', 'memo', 'remarks', 'transaction description'],
  amount: ['amount', 'transaction amount', 'value', 'total'],
  debit: ['debit', 'withdrawal', 'withdrawals', 'money out', 'paid out', 'charge', 'charges', 'outflow'],
  credit: ['credit', 'deposit', 'deposits', 'money in', 'paid in', 'inflow'],
  currency: ['currency', 'ccy', 'curr'],
  type: ['type', 'transaction type', 'dr cr', 'debit credit', 'direction'],
  reference: ['reference', 'reference number', 'transaction id', 'trace number', 'rrn'],
  balance: ['balance', 'running balance', 'available balance']
};

export const MAPPING_FIELDS = [
  { key: 'date', label: 'Transaction date', required: true, help: 'When the payment happened.' },
  { key: 'description', label: 'Description / merchant', required: true, help: 'Who received or sent the money.' },
  { key: 'amount', label: 'Amount', required: false, help: 'Use this when your statement has one signed amount column.' },
  { key: 'debit', label: 'Debit / money out', required: false, help: 'Use for withdrawals and payments.' },
  { key: 'credit', label: 'Credit / money in', required: false, help: 'Use for deposits and refunds.' },
  { key: 'currency', label: 'Currency', required: false, help: 'Optional; defaults to PHP when absent.' },
  { key: 'type', label: 'Transaction type', required: false, help: 'Optional debit/credit indicator.' },
  { key: 'reference', label: 'Reference number', required: false, help: 'Optional transaction identifier.' },
  { key: 'balance', label: 'Balance', required: false, help: 'Optional running balance; not used as the transaction amount.' }
];

function headerKey(value) {
  return String(value ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function suggestColumnMapping(headers = []) {
  const mapping = Object.fromEntries(MAPPING_FIELDS.map(field => [field.key, '']));
  const normalized = headers.map((header, index) => ({ index: String(index), key: headerKey(header) }));
  for (const field of MAPPING_FIELDS) {
    const aliases = FIELD_ALIASES[field.key].map(headerKey);
    const match = normalized.find(column => aliases.includes(column.key));
    if (match) mapping[field.key] = match.index;
  }
  // Avoid interpreting a generic "amount" as debit or credit when a dedicated amount exists.
  if (mapping.amount) {
    if (mapping.debit === mapping.amount) mapping.debit = '';
    if (mapping.credit === mapping.amount) mapping.credit = '';
  }
  return mapping;
}

export function validateColumnMapping(mapping) {
  const errors = [];
  if (!mapping.date) errors.push('Choose the column containing the transaction date.');
  if (!mapping.description) errors.push('Choose the column containing the merchant or transaction description.');
  const hasAmount = Boolean(mapping.amount);
  const hasDebitCredit = Boolean(mapping.debit || mapping.credit);
  if (!hasAmount && !hasDebitCredit) errors.push('Choose an Amount column, or map Debit and/or Credit columns.');
  if (hasAmount && hasDebitCredit) errors.push('Use either one signed Amount column or separate Debit/Credit columns, not both.');
  const selected = Object.entries(mapping).filter(([, value]) => value !== '').map(([key]) => key);
  const valueToFields = new Map();
  for (const key of selected) {
    const value = mapping[key];
    if (!valueToFields.has(value)) valueToFields.set(value, []);
    valueToFields.get(value).push(key);
  }
  for (const fields of valueToFields.values()) {
    if (fields.length > 1) errors.push(`The same column is assigned to multiple fields (${fields.join(', ')}). Choose a different column for each field.`);
  }
  return errors;
}
