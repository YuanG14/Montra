const CANDIDATES = [',', ';', '\t', '|'];

function countOutsideQuotes(line, delimiter) {
  let count = 0, quoted = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (quoted && line[i + 1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted && line[i] === delimiter) count++;
  }
  return count;
}

export function detectDelimiter(text) {
  const sample = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).filter(line => line.trim()).slice(0, 12);
  if (!sample.length) return ',';
  return CANDIDATES.map(delimiter => {
    const counts = sample.map(line => countOutsideQuotes(line, delimiter));
    const nonzero = counts.filter(n => n > 0);
    const consistency = nonzero.length ? nonzero.length / counts.length : 0;
    const avg = nonzero.length ? nonzero.reduce((a, b) => a + b, 0) / nonzero.length : 0;
    return { delimiter, score: consistency * avg };
  }).sort((a, b) => b.score - a.score)[0].delimiter;
}

export function parseCSV(text, delimiter = detectDelimiter(text)) {
  const rows = [];
  let row = [], cell = '', quoted = false, malformed = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += ch;
    } else if (ch === '"') {
      if (cell.length === 0) quoted = true;
      else { cell += ch; malformed = true; }
    } else if (ch === delimiter) {
      row.push(cell); cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(value => value.trim() !== '')) rows.push({ values: row, malformed });
      row = []; malformed = false;
    } else cell += ch;
  }
  if (quoted) malformed = true;
  row.push(cell);
  if (row.some(value => value.trim() !== '')) rows.push({ values: row, malformed });
  return { rows, delimiter, unclosedQuote: quoted };
}

export function normalizeHeader(value, index) {
  const clean = String(value ?? '').replace(/^\uFEFF/, '').trim().replace(/\s+/g, ' ');
  return clean || `Column ${index + 1}`;
}

export function detectHeaderRow(rows) {
  const first = rows?.[0]?.values || [];
  if (!first.length) return false;
  const normalized = first.map(value => String(value).trim().toLowerCase());
  const known = /date|time|description|details|merchant|payee|amount|debit|credit|balance|transaction|reference|type|currency|memo|narration/;
  if (normalized.some(value => known.test(value))) return true;
  const textCells = normalized.filter(value => /[a-zA-Z]/.test(value) && !/^\d{4}[-/]\d{1,2}/.test(value));
  return textCells.length / normalized.length >= 0.7;
}
