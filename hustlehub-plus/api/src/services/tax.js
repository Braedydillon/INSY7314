export function calculateTax(incomeCents, table) {
  const income = Math.max(0, Math.floor(Number(incomeCents) || 0));

  let lower = 0;
  let grossTax = 0;
  let marginalRate = 0;
  const bands = [];

  for (const { upToCents, rate } of table.brackets) {
    const upper = upToCents ?? Infinity;
    const taxableCents = Math.max(0, Math.min(income, upper) - lower);
    const bandTax = taxableCents * rate;

    if (taxableCents > 0) marginalRate = rate;

    bands.push({
      fromCents: lower,
      toCents: upToCents,
      rate,
      taxableCents,
      taxCents: Math.round(bandTax),
    });

    grossTax += bandTax;
    lower = upper;
  }

  const grossTaxCents = Math.round(grossTax);
  const rebateCents = Math.min(grossTaxCents, table.primaryRebateCents);
  const taxCents = grossTaxCents - rebateCents;

  return {
    incomeCents: income,
    grossTaxCents,
    rebateCents,
    taxCents,
    effectiveRate: income > 0 ? taxCents / income : 0,
    marginalRate: taxCents > 0 ? marginalRate : 0,
    bands,
  };
}
