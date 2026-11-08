export async function readCsvFile(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let encoding = 'utf-8';
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) encoding = 'utf-16le';
  else if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) encoding = 'utf-16be';
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(buffer);
  } catch {
    if (encoding !== 'utf-8') throw new Error('This file uses an encoding Montra could not read. Re-export it as UTF-8 CSV.');
    try { return new TextDecoder('windows-1252').decode(buffer); }
    catch { throw new Error('We could not decode this file. Re-export it as UTF-8 CSV.'); }
  }
}
