// Import sessions intentionally live only in React memory. Never write source
// statements or parsed transaction rows to localStorage, IndexedDB, or a server.
export function createImportSession({ fileName, fileSize, headers, rows, delimiter, warnings }) {
  return { fileName, fileSize, headers, rows, delimiter, warnings, createdAt: new Date().toISOString() };
}
