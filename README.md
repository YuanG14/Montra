# Montra — Subscription tracker

Montra is a React + Vite subscription tracker. Subscription data remains in the browser in this release. CSV statement import and normalization run locally in the browser and do not upload raw statement contents.

## Run it

1. Install Node.js (LTS recommended).
2. In this folder, run `npm install`.
3. Run `npm run dev`.
4. Open the local address Vite prints (usually `http://localhost:5173`).

Production build: `npm run build`  
Preview a production build: `npm run preview`  
Run import utility tests: `npm test`

## Current features

- Overview: monthly and yearly totals, budget ring, upcoming renewals and overlap tip.
- Cards: search, filter, sort, add, edit, pause, cancel and delete subscriptions.
- Cancel guide: cancellation guidance for popular services.
- Reminders: in-app renewal reminders and reminder timing settings.
- CSV import: local file upload, delimiter and encoding handling, background parsing, header detection, transaction preview, column mapping, date and amount normalization, debit/credit direction handling, merchant cleanup, exact-duplicate flagging and rejected-row review.
- Currency, monthly budget and reminder settings.

## Phase 6 — transaction mapping and normalization

After a CSV is previewed, users can map its columns to Montra's standard fields:

- Transaction date
- Description / merchant
- Amount, or separate Debit and Credit columns
- Currency (optional; PHP is the default)
- Transaction type, reference and balance (optional)

Montra then standardizes dates and amounts, identifies money-in / money-out direction where the statement provides enough information, cleans obvious reference codes from merchant descriptions, flags exact duplicate rows and separates rows that cannot be normalized. Ambiguous date formats can be explicitly set to MDY or DMY. Positive signed amounts without a transaction-type field are left as unknown direction rather than guessed.

This phase prepares data only. It does not save imported transactions or create subscriptions. Merchant recognition and recurring-payment detection are later phases.

## CSV import privacy

The CSV importer processes the statement in the browser. The original file and parsed transaction rows are not sent to a server and are not written to localStorage. Parsing runs in a browser worker where supported. The import session exists only in React memory and is cleared when the user removes the file or leaves the page.

Limits: `.csv` files up to 15 MB and 100,000 rows. The importer detects comma, semicolon, tab and pipe delimiters. Account-like columns are masked in the preview when their headers are recognizable. Review the original statement and remove unnecessary personal information before importing.

A fictional sample file is included at `examples/sample-transactions.csv` for testing. It contains no real account data.

## Data compatibility

Existing subscription data remains under the original localStorage key `subtrack.v1` so the Montra rebrand does not discard existing browser data. Clearing browser site data will still erase locally stored subscriptions.

## Project structure

- `src/App.jsx`: app shell and navigation.
- `src/pages.jsx`: Overview, Cards and Cancel Guide.
- `src/pages/ImportPage.jsx`: CSV import, mapping and normalization experience.
- `src/lib/store.js`: browser storage abstraction; future backend work will replace this layer.
- `src/lib/import/`: CSV parsing, decoding, validation, column mapping, normalization and temporary import session helpers.
- `src/lib/utils.js`: date, currency and renewal calculations.
- `src/Dialogs.jsx`: add/edit, settings, reminders and cancellation dialogs.
- `tests/`: Node.js tests for mapping and normalization utilities.
- `public/logos/`: optional service logos.

## Current limitations

- No bank connections or automatic statement fetching.
- No dedicated BPI, BDO, GCash or Maya import templates yet (Phase 7).
- Merchant catalog and recurring-payment detection are not implemented yet (Phases 8–9).
- Normalized transactions are not persisted or added to subscriptions.
- No backend, MongoDB, user accounts or cloud sync yet.
- Reminders appear only while the app is open.
