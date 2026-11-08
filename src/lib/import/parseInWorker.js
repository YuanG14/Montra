export function parseInWorker(text, requestedDelimiter = null) {
  if (typeof Worker === 'undefined') {
    return Promise.reject(new Error('This browser does not support background file processing. Please use a recent version of Chrome, Edge, Firefox or Safari.'));
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./csvWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = event => {
      worker.terminate();
      if (event.data?.ok) resolve(event.data.parsed);
      else reject(new Error(event.data?.error || 'CSV parsing failed.'));
    };
    worker.onerror = () => { worker.terminate(); reject(new Error('The CSV parser stopped unexpectedly. Try exporting the statement again.')); };
    worker.postMessage({ text, requestedDelimiter });
  });
}
