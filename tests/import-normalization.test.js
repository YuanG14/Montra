import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStatementAmount, parseStatementDate, cleanMerchantName, normalizeTransactions } from '../src/lib/import/normalizeTransactions.js';
import { suggestColumnMapping, validateColumnMapping } from '../src/lib/import/columnMapping.js';

test('parses common amount formats', () => {
  assert.equal(parseStatementAmount('₱ 1,234.56'), 1234.56);
  assert.equal(parseStatementAmount('1.234,56'), 1234.56);
  assert.equal(parseStatementAmount('(500.00)'), -500);
  assert.equal(parseStatementAmount('1,25'), 1.25);
  assert.equal(parseStatementAmount('1,000'), 1000);
  assert.equal(parseStatementAmount('not an amount'), null);
});

test('parses ISO and selected day-first dates', () => {
  assert.equal(parseStatementDate('2026-10-31'), '2026-10-31');
  assert.equal(parseStatementDate('31/10/2026', 'DMY'), '2026-10-31');
  assert.equal(parseStatementDate('10/31/2026', 'MDY'), '2026-10-31');
  assert.equal(parseStatementDate('31/19/2026', 'DMY'), null);
});

test('cleans merchant references without discarding the merchant', () => {
  assert.equal(cleanMerchantName('NETFLIX.COM REF: ABC123456789'), 'NETFLIX.COM');
});

test('suggests a valid mapping for a typical statement', () => {
  const mapping = suggestColumnMapping(['Transaction Date', 'Description', 'Amount', 'Type', 'Currency']);
  assert.equal(mapping.date, '0');
  assert.equal(mapping.description, '1');
  assert.equal(mapping.amount, '2');
  assert.equal(mapping.type, '3');
  assert.deepEqual(validateColumnMapping(mapping), []);
});

test('normalizes rows, flags exact duplicates and rejects invalid rows', () => {
  const mapping = suggestColumnMapping(['Transaction Date', 'Description', 'Amount', 'Type', 'Currency']);
  const result = normalizeTransactions({
    mapping,
    rows: [
      ['2026-10-01', 'NETFLIX.COM REF: ABC123456789', '499.00', 'Debit', 'PHP'],
      ['2026-10-01', 'NETFLIX.COM REF: ABC123456789', '499.00', 'Debit', 'PHP'],
      ['bad date', '', 'oops', 'Debit', 'PHP']
    ]
  });
  assert.equal(result.includedCount, 1);
  assert.equal(result.duplicateCount, 1);
  assert.equal(result.rejected.length, 1);
  assert.equal(result.transactions[0].merchant, 'NETFLIX.COM');
  assert.equal(result.transactions[0].direction, 'expense');
  assert.equal(result.transactions[1].included, false);
});

test('supports separate debit and credit columns', () => {
  const mapping = suggestColumnMapping(['Date', 'Merchant', 'Debit', 'Credit']);
  const result = normalizeTransactions({ mapping, rows: [
    ['2026-10-01', 'Store A', '250.00', ''],
    ['2026-10-02', 'Salary', '', '15000.00']
  ] });
  assert.equal(result.expenseCount, 1);
  assert.equal(result.incomeCount, 1);
  assert.equal(result.transactions[0].amount, 250);
  assert.equal(result.transactions[1].direction, 'income');
});

test('recognizes negative amounts with a currency prefix', () => {
  assert.equal(parseStatementAmount('PHP -1,250.00'), -1250);
  assert.equal(parseStatementAmount('₱ -250.50'), -250.5);
});
