export const TAX_TABLES = {
  2027: {
    label: '2026/27',
    source: 'SARS - https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/',
    primaryRebateCents: 1_782_000,
    brackets: [
      { upToCents: 24_510_000, rate: 0.18 },
      { upToCents: 38_310_000, rate: 0.26 },
      { upToCents: 53_020_000, rate: 0.31 },
      { upToCents: 69_580_000, rate: 0.36 },
      { upToCents: 88_700_000, rate: 0.39 },
      { upToCents: 187_860_000, rate: 0.41 },
      { upToCents: null, rate: 0.45 },
    ],
  },
};

export function taxYearFor(date) {
  const d = new Date(date);
  return d.getUTCMonth() >= 2 ? d.getUTCFullYear() + 1 : d.getUTCFullYear();
}

export function taxYearRange(taxYear) {
  return {
    start: new Date(Date.UTC(taxYear - 1, 2, 1)),
    end: new Date(Date.UTC(taxYear, 2, 1)),
  };
}

export function getTaxTable(taxYear) {
  const table = TAX_TABLES[taxYear];
  if (!table) {
    throw new Error(`No tax table for year of assessment ${taxYear}`);
  }
  return table;
}
