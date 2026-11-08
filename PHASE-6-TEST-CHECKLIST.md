# Montra Phase 6 — Browser test checklist

Before testing, run `npm install` and `npm run dev` from the project folder.

## Test with the included sample

1. Open Import and upload `examples/sample-transactions.csv`.
2. Confirm six transaction rows appear in the preview.
3. Continue to column mapping.
4. Confirm Transaction Date, Description, Amount and Type are suggested automatically.
5. Confirm the optional Currency field is left unmapped and PHP is used as the default.
6. Normalize the transactions.
7. Confirm six rows are included, all six are marked Money out, and none are rejected or duplicated.

## Test column mapping

- Upload a CSV with separate Debit and Credit columns.
- Confirm Montra suggests the separate columns.
- Confirm a debit row is Money out and a credit row is Money in.
- Change the date format to DMY and test a date such as `31/10/2026`.
- Change a mapping to the wrong column and confirm the result warnings or rejected rows are understandable.

## Test duplicate handling

- Add an identical date, merchant, amount and currency row to a copy of the sample CSV.
- Confirm the duplicate is flagged and excluded by default.
- Turn on “Include potential duplicates” and confirm the included count changes.
- Confirm legitimate same-merchant charges on different dates are not flagged as exact duplicates.

## Test validation and privacy

- Try a row with an invalid date, missing description or non-numeric amount; confirm it appears under rows needing correction.
- Try a future date and a zero amount; confirm a warning appears.
- Remove the file and confirm the preview and normalization results disappear.
- Refresh or leave Import and return; confirm the raw statement is not restored from localStorage.
- Confirm existing subscriptions on Cards and Overview are unchanged.

## Automated checks

Run `npm test`. The included Node.js utility suite covers amount formats, date formats, merchant cleanup, mapping suggestions, debit/credit handling, duplicate detection and rejected rows.
