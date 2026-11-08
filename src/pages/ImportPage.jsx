import { useMemo, useRef, useState } from 'react';
import { detectHeaderRow, normalizeHeader } from '../lib/import/csvParser.js';
import { validateFile, validateRows } from '../lib/import/fileValidator.js';
import { createImportSession } from '../lib/import/importSession.js';
import { readCsvFile } from '../lib/import/readCsvFile.js';
import { parseInWorker } from '../lib/import/parseInWorker.js';
import { MAPPING_FIELDS, suggestColumnMapping, validateColumnMapping } from '../lib/import/columnMapping.js';
import { normalizeTransactions } from '../lib/import/normalizeTransactions.js';

const DELIMITER_LABELS = { ',': 'Comma', ';': 'Semicolon', '\t': 'Tab', '|': 'Pipe' };
const prettySize = bytes => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
const isSensitiveHeader = value => /account|card.?number|iban|swift|routing|phone|mobile|email|address|customer.?id|tax.?id/i.test(value);
const isSensitiveValue = value => /\b\d{12,19}\b/.test(String(value ?? ''));
const maskSensitive = value => { const digits = String(value ?? '').replace(/\D/g, ''); return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : '•••• hidden'; };
const formatMoney = (amount, currency = 'PHP') => { const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : 'PHP'; try { return new Intl.NumberFormat('en-PH', { style: 'currency', currency: safeCurrency, maximumFractionDigits: 2 }).format(amount); } catch { return `${safeCurrency} ${Number(amount).toFixed(2)}`; } };

export default function ImportPage() {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [notice, setNotice] = useState('');
  const [step, setStep] = useState('preview');
  const [mapping, setMapping] = useState({});
  const [dateFormat, setDateFormat] = useState('auto');
  const [normalized, setNormalized] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);

  const preview = useMemo(() => {
    if (!session) return null;
    const sourceRows = session.rows;
    const headers = hasHeader
      ? (sourceRows[0]?.values || []).map((value, index) => normalizeHeader(value, index))
      : (sourceRows[0]?.values || []).map((_, index) => `Column ${index + 1}`);
    const dataRows = hasHeader ? sourceRows.slice(1) : sourceRows;
    const duplicateHeaders = headers.filter((header, index) => headers.findIndex(item => item.toLowerCase() === header.toLowerCase()) !== index);
    return { headers, dataRows, duplicateHeaders };
  }, [session, hasHeader]);

  async function loadFile(file) {
    if (busy) return;
    setError(''); setNotice(''); setSession(null); setNormalized(null); setStep('preview');
    const fileErrors = validateFile(file);
    if (fileErrors.length) { setError(fileErrors[0]); return; }
    setBusy(true);
    try {
      const text = await readCsvFile(file);
      if (!text.trim()) throw new Error('This file does not contain any readable text.');
      const parsed = await parseInWorker(text);
      const detectedHeader = detectHeaderRow(parsed.rows);
      const validation = validateRows(parsed.rows, parsed.unclosedQuote);
      if (validation.errors.length) throw new Error(validation.errors[0]);
      if (detectedHeader && parsed.rows.length < 2) throw new Error('This file has column names but no transaction rows. Choose a statement with transaction data.');
      setHasHeader(detectedHeader);
      const headers = (parsed.rows[0]?.values || []).map((value, index) => normalizeHeader(value, index));
      const duplicateHeaders = headers.filter((header, index) => headers.findIndex(item => item.toLowerCase() === header.toLowerCase()) !== index);
      const warnings = [...validation.warnings];
      if (duplicateHeaders.length) warnings.push('Some column names are repeated. Resolve them during column mapping.');
      if (headers.some(isSensitiveHeader)) warnings.push('Some columns look like personal or account identifiers. Sensitive values are masked in the preview.');
      if (parsed.rows.some(row => row.values.some(value => /\b\d{12,19}\b/.test(value)))) warnings.push('Some values resemble long account or card numbers. Review the original statement and remove unnecessary identifiers.');
      setSession(createImportSession({ fileName: file.name, fileSize: file.size, headers, rows: parsed.rows, delimiter: parsed.delimiter, warnings }));
      setNotice('File read successfully. Your statement has not been uploaded or saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not read this file. Try exporting it again as CSV.');
    } finally { setBusy(false); }
  }

  function clearImport() {
    setSession(null); setError(''); setNotice(''); setHasHeader(true); setStep('preview'); setMapping({}); setNormalized(null); setShowAll(false); setIncludeDuplicates(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function beginMapping() {
    setMapping(suggestColumnMapping(preview.headers));
    setNormalized(null);
    setStep('mapping');
  }

  function runNormalization() {
    const mappingErrors = validateColumnMapping(mapping);
    if (mappingErrors.length) { setError(mappingErrors[0]); return; }
    setError('');
    const rows = preview.dataRows.map(row => row.values);
    setNormalized(normalizeTransactions({ rows, mapping, dateFormat, defaultCurrency: 'PHP' }));
    setStep('results');
    setShowAll(false);
    setIncludeDuplicates(false);
  }

  const rowCount = preview?.dataRows.length || 0;
  const columnCount = preview?.headers.length || 0;
  const previewRows = preview?.dataRows.slice(0, 12) || [];
  const resultRows = normalized?.transactions || [];
  const visibleResultRows = showAll ? resultRows : resultRows.slice(0, 30);
  const selectedResultRows = resultRows.filter(item => !item.duplicate || includeDuplicates);
  const selectedExpenses = selectedResultRows.filter(item => item.direction === 'expense').length;
  const selectedIncome = selectedResultRows.filter(item => item.direction === 'income').length;
  const selectedUnknown = selectedResultRows.filter(item => item.direction === 'unknown').length;

  return (
    <section className="import-page">
      <div className="import-heading">
        <div>
          <p className="eyebrow">DATA IMPORT</p>
          <h1 className="h1s">Import transactions</h1>
          <p className="mu import-intro">Prepare a bank or wallet statement for subscription analysis. Map its columns, standardize the values and review anything unusual before moving on.</p>
        </div>
        <div className="import-step"><span>{step === 'preview' ? '01' : step === 'mapping' ? '02' : '03'}</span><div><b>{step === 'preview' ? 'Upload statement' : step === 'mapping' ? 'Map columns' : 'Review cleaned data'}</b><small>Processed locally · No automatic saving</small></div></div>
      </div>

      <div className="privacy-banner" role="note">
        <span className="privacy-icon" aria-hidden="true">⌑</span>
        <div><b>Your statement stays private</b><p>Montra processes the file in your browser. The original statement and normalized transactions are not sent to a server or saved to your account.</p></div>
      </div>

      {!session ? (
        <div className="import-layout">
          <div className={`upload-panel ${dragging ? 'is-dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); loadFile(event.dataTransfer.files?.[0]); }}>
            <div className="upload-symbol" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 31V8m0 0-8 8m8-8 8 8M9 29v9a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3v-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <h2>Drop your CSV file here</h2><p className="mu">or choose a file from your device</p>
            <button className="btn" type="button" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? 'Reading file…' : 'Choose CSV file'}</button>
            <input ref={inputRef} className="visually-hidden" type="file" accept=".csv,text/csv,application/vnd.ms-excel" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; loadFile(file); }} aria-label="Choose a CSV statement" />
            <small className="upload-meta">CSV only · Maximum 15 MB · Up to 100,000 rows</small>
          </div>
          <aside className="panel import-side">
            <h2>Before you upload</h2>
            <ul className="import-checklist">
              <li><span>✓</span><div><b>Export as CSV</b><small>Choose CSV rather than PDF, Excel or a screenshot.</small></div></li>
              <li><span>✓</span><div><b>Include transaction details</b><small>Date, description or merchant, and amount are useful.</small></div></li>
              <li><span>✓</span><div><b>Remove what you don't need</b><small>Exclude account numbers or unrelated columns when possible.</small></div></li>
            </ul>
            <div className="supported-box"><b>Designed for</b><p>BPI · BDO · GCash · Maya · Other CSV statements</p><small>Dedicated bank presets are planned for Phase 7.</small></div>
          </aside>
        </div>
      ) : (
        <div className="panel import-result">
          <div className="file-summary">
            <div className="file-icon" aria-hidden="true">CSV</div>
            <div className="file-name"><b>{session.fileName}</b><small>{prettySize(session.fileSize)} <span>·</span> {DELIMITER_LABELS[session.delimiter]} separated</small></div>
            <span className="pill grn">Read locally</span>
            <button className="text-button" type="button" onClick={clearImport}>Remove file</button>
          </div>

          <div className="import-stats">
            <div><strong>{rowCount.toLocaleString()}</strong><small>Transaction rows</small></div>
            <div><strong>{columnCount}</strong><small>Columns detected</small></div>
            <div><strong>{session.rows.length.toLocaleString()}</strong><small>Total non-empty rows</small></div>
          </div>

          {step === 'preview' && <>
            <div className="phase-progress"><span className="phase-current">1. File preview</span><span>2. Column mapping</span><span>3. Cleaned data</span></div>
            <div className="preview-heading"><div><h2>Transaction preview</h2><p className="mu sm">Showing up to 12 rows. No transactions have been added.</p></div><span className="pill pur">Preview only</span></div>
            <div className="preview-options">
              <label className="toggle-label"><input type="checkbox" checked={hasHeader} onChange={event => setHasHeader(event.target.checked)} /> First row contains column names</label>
              <span className="delimiter-label">Detected delimiter <b>{DELIMITER_LABELS[session.delimiter]}</b></span>
            </div>
            <div className="table-scroll"><table className="preview-table"><thead><tr>{preview?.headers.map((header, index) => <th key={`${header}-${index}`}>{header}</th>)}</tr></thead><tbody>{previewRows.map((row, index) => <tr key={index}>{preview.headers.map((_, columnIndex) => <td key={columnIndex}>{row.values[columnIndex] == null || row.values[columnIndex] === '' ? <span className="mu">—</span> : (isSensitiveHeader(preview.headers[columnIndex]) || isSensitiveValue(row.values[columnIndex])) ? <span className="masked-value" title="Potentially sensitive value masked in preview">{maskSensitive(row.values[columnIndex])}</span> : row.values[columnIndex]}</td>)}</tr>)}</tbody></table></div>
            {rowCount > 12 && <p className="preview-foot">Showing 12 of {rowCount.toLocaleString()} transaction rows.</p>}
            {!hasHeader && <div className="validation-box warning"><b>Header row disabled</b><p>The first row is treated as transaction data. Montra will assign temporary column names.</p></div>}
            {session.warnings.length > 0 && <div className="validation-box warning"><b>Review these notes</b><ul>{session.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}
            {preview?.duplicateHeaders.length > 0 && <div className="validation-box warning"><b>Repeated column names</b><p>{[...new Set(preview.duplicateHeaders)].join(', ')}. Rename or map carefully in the next step.</p></div>}
            <div className="import-footer"><p className="mu sm">Next, match the statement columns to Montra's standard transaction fields.</p><button className="btn" type="button" onClick={beginMapping}>Continue to column mapping <span aria-hidden="true">→</span></button></div>
          </>}

          {step === 'mapping' && <>
            <div className="phase-progress"><span>1. File preview</span><span className="phase-current">2. Column mapping</span><span>3. Cleaned data</span></div>
            <div className="preview-heading"><div><h2>Match your columns</h2><p className="mu sm">Montra suggested some matches. Check each one before continuing.</p></div><span className="pill pur">Mapping</span></div>
            <div className="mapping-intro"><b>How column mapping works</b><p>Choose which CSV column represents each transaction field. Date, description and an amount source are required. You can use one signed Amount column or separate Debit and Credit columns.</p></div>
            <div className="mapping-grid">
              {MAPPING_FIELDS.map(field => <label className="mapping-field" key={field.key}>
                <span className="mapping-label">{field.label} {field.required && <em>Required</em>}</span>
                <select value={mapping[field.key] ?? ''} onChange={event => setMapping(current => ({ ...current, [field.key]: event.target.value }))}>
                  <option value="">Not mapped</option>
                  {preview.headers.map((header, index) => <option value={String(index)} key={`${header}-${index}`}>{header || `Column ${index + 1}`}</option>)}
                </select>
                <small>{field.help}</small>
              </label>)}
            </div>
            <div className="mapping-options"><label><span>Date format</span><select value={dateFormat} onChange={event => setDateFormat(event.target.value)}><option value="auto">Auto-detect where possible</option><option value="MDY">Month / Day / Year (MM/DD/YYYY)</option><option value="DMY">Day / Month / Year (DD/MM/YYYY)</option></select></label><p>Ambiguous dates such as 04/05/2026 are interpreted using this setting.</p></div>
            <div className="validation-box info"><b>Currency handling</b><p>If no currency column is mapped, Montra uses PHP as the default. You can review and correct this in a later step.</p></div>
            <div className="import-footer"><button className="btn ghost" type="button" onClick={() => { setError(''); setStep('preview'); }}>Back to preview</button><button className="btn" type="button" onClick={runNormalization}>Normalize transactions <span aria-hidden="true">→</span></button></div>
          </>}

          {step === 'results' && normalized && <>
            <div className="phase-progress"><span>1. File preview</span><span>2. Column mapping</span><span className="phase-current">3. Cleaned data</span></div>
            <div className="preview-heading"><div><h2>Normalization results</h2><p className="mu sm">Standardized transaction data. Review warnings and duplicates before the next phase.</p></div><span className="pill grn">Processed locally</span></div>
            <div className="normalization-stats">
              <div><strong>{normalized.totalRows.toLocaleString()}</strong><small>Source rows</small></div>
              <div><strong>{selectedResultRows.length.toLocaleString()}</strong><small>Included transactions</small></div>
              <div><strong>{normalized.rejected.length.toLocaleString()}</strong><small>Needs correction</small></div>
              <div><strong>{normalized.duplicateCount.toLocaleString()}</strong><small>Duplicates excluded</small></div>
            </div>
            <div className="direction-summary"><span><i className="direction-dot expense"/> {selectedExpenses} money out</span><span><i className="direction-dot income"/> {selectedIncome} money in</span><span><i className="direction-dot unknown"/> {selectedUnknown} unknown direction</span></div>
            {normalized.warnings.length > 0 && <div className="validation-box warning"><b>Review recommended</b><ul>{normalized.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}
            <div className="preview-heading normalized-table-heading"><div><h2>Cleaned transactions</h2><p className="mu sm">Potential duplicates are excluded by default, but you can include them if they represent separate real charges.</p></div><span className="pill pur">{resultRows.length} rows</span></div>
            <label className="toggle-label duplicate-toggle"><input type="checkbox" checked={includeDuplicates} onChange={event => setIncludeDuplicates(event.target.checked)} /> Include potential duplicates in the cleaned set ({normalized.duplicateCount})</label>
            <div className="table-scroll"><table className="preview-table normalized-table"><thead><tr><th>Date</th><th>Merchant (cleaned)</th><th>Amount</th><th>Direction</th><th>Currency</th><th>Review</th></tr></thead><tbody>{visibleResultRows.map(item => <tr key={item.id} className={item.duplicate ? 'duplicate-row' : ''}><td>{item.date}</td><td title={item.originalDescription}>{item.merchant}<small className="original-description">{item.originalDescription}</small></td><td>{formatMoney(item.amount, item.currency)}</td><td><span className={`direction-tag ${item.direction}`}>{item.direction === 'expense' ? 'Money out' : item.direction === 'income' ? 'Money in' : 'Unknown'}</span></td><td>{item.currency}</td><td>{item.duplicate ? <span className="pill amb">Duplicate · {includeDuplicates ? 'included' : 'excluded'}</span> : item.warnings.length ? <span className="pill amb">Check row</span> : <span className="pill grn">Clean</span>}</td></tr>)}</tbody></table></div>
            {resultRows.length > 30 && <button className="text-button show-more" type="button" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show fewer rows' : `Show all ${resultRows.length.toLocaleString()} rows`}</button>}
            {normalized.rejected.length > 0 && <div className="rejected-section"><h3>Rows that need correction ({normalized.rejected.length})</h3><p className="mu sm">These rows were not included in the cleaned transaction list.</p><div className="table-scroll"><table className="preview-table"><thead><tr><th>Source row</th><th>Date value</th><th>Description</th><th>Amount value</th><th>Reason</th></tr></thead><tbody>{normalized.rejected.slice(0, 20).map(item => <tr key={item.rowNumber}><td>{item.rowNumber}</td><td>{item.rawDate || '—'}</td><td>{item.rawDescription || '—'}</td><td>{item.rawAmount || '—'}</td><td>{item.reasons.join(' ')}</td></tr>)}</tbody></table></div>{normalized.rejected.length > 20 && <p className="preview-foot">Showing first 20 rejected rows.</p>}</div>}
            <div className="import-footer"><p className="mu sm">Phase 6 prepares data only. Nothing has been saved to your subscriptions or browser storage.</p><div className="mapping-actions"><button className="btn ghost" type="button" onClick={() => setStep('mapping')}>Edit mapping</button><button className="btn ghost" type="button" onClick={clearImport}>Clear import</button></div></div>
          </>}
        </div>
      )}

      {error && <div className="validation-box error" role="alert"><b>Couldn't continue</b><p>{error}</p><button className="text-button" onClick={() => setError('')} type="button">Dismiss</button></div>}
      {notice && <p className="import-notice" role="status">{notice}</p>}

      <div className="import-bottom-grid">
        <div><span className="mini-icon">01</span><b>Local processing</b><p>CSV contents stay in this browser session.</p></div>
        <div><span className="mini-icon">02</span><b>Consistent transaction data</b><p>Dates, amounts and merchants are standardized.</p></div>
        <div><span className="mini-icon">03</span><b>Review before saving</b><p>Nothing is added to your subscriptions automatically.</p></div>
      </div>
    </section>
  );
}
