const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_ROWS = 100000;

export function validateFile(file) {
  const errors = [];
  if (!file) errors.push('Choose a CSV file to continue.');
  else {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') errors.push('This file does not appear to be a CSV. Choose a .csv file.');
    if (file.size === 0) errors.push('This file is empty.');
    if (file.size > MAX_FILE_BYTES) errors.push('This file is larger than 15 MB. Export a smaller date range and try again.');
  }
  return errors;
}

export function validateRows(rows, unclosedQuote) {
  const errors = [], warnings = [];
  if (!rows.length) errors.push('No transaction rows were found. Check that the file contains data.');
  if (unclosedQuote) errors.push('The CSV contains an unfinished quoted field. Check the file and export it again.');
  if (rows.length > MAX_ROWS) errors.push('This file contains more than 100,000 rows. Import a smaller statement.');
  if (rows.length && rows[0].values.length < 2) errors.push('Only one column was detected. Check the delimiter or export the statement as CSV.');
  const width = rows[0]?.values.length || 0;
  const inconsistent = rows.slice(1).filter(row => row.values.length !== width).length;
  if (inconsistent) warnings.push(`${inconsistent} row${inconsistent === 1 ? '' : 's'} have a different number of columns and may need attention.`);
  const malformed = rows.filter(row => row.malformed).length;
  if (malformed) warnings.push(`${malformed} row${malformed === 1 ? '' : 's'} contain unusual quote formatting.`);
  if (rows.length > 1 && rows[0].values.length > 0 && rows[0].values.every(v => /^\d+([.,]\d+)?$/.test(v.trim()))) warnings.push('The first row looks numeric. Your file may not contain a header row.');
  return { errors, warnings };
}
