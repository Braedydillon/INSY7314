import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTax } from '../src/services/tax.js';
import { getTaxTable, taxYearFor, taxYearRange } from '../src/config/taxTables.js';

const table = getTaxTable(2027);
const rands = (r) => Math.round(r * 100);

test('no income is untaxed', () => {
  assert.equal(calculateTax(0, table).taxCents, 0);
});

test('negative value is zero', () => {
  assert.equal(calculateTax(-5000, table).taxCents, 0);
  assert.equal(calculateTax(undefined, table).taxCents, 0);
});

test('income below first band is untaxed', () => {
  const result = calculateTax(rands(99_000), table);
  assert.equal(result.grossTaxCents, rands(17_820));
  assert.equal(result.taxCents, 0);
  assert.equal(result.marginalRate, 0);
});

test('income above first band is taxed 18%', () => {
  assert.equal(calculateTax(rands(99_001), table).taxCents, 18);
});

test('top band income is taxed', () => {
  const result = calculateTax(rands(2_000_000), table);
  assert.equal(result.taxCents, rands(703_149));
  assert.equal(result.marginalRate, 0.45);
});

test('every band is returned, with empty bands at zero', () => {
  const result = calculateTax(rands(300_000), table);
  assert.equal(result.bands.length, 7);
  assert.equal(result.bands[1].taxableCents, rands(54_900));
  assert.equal(result.bands[2].taxableCents, 0);
});

test('an unknown tax year is rejected', () => {
  assert.throws(() => getTaxTable(1999));
});
