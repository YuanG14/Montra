import { detectDelimiter, parseCSV } from './csvParser.js';

self.onmessage = event => {
  const { text, requestedDelimiter } = event.data || {};
  try {
    const delimiter = requestedDelimiter || detectDelimiter(text);
    const parsed = parseCSV(text, delimiter);
    self.postMessage({ ok: true, parsed });
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : 'CSV parsing failed.' });
  }
};
