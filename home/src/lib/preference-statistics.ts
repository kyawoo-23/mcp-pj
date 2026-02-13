import { cumulativeStdNormalProbability } from "simple-statistics";

/**
 * Chi-square goodness-of-fit test for categorical data.
 * Tests whether observed counts differ from expected (default: uniform).
 *
 * @param observedCounts - Observed frequency per category
 * @param expectedCounts - Expected frequency per category; if omitted, uses uniform (total/k)
 * @returns { chi2, pValue, df } or null if invalid (e.g. expected too small, zero categories)
 */
export function chiSquareGoodnessOfFit(
  observedCounts: number[],
  expectedCounts?: number[],
): { chi2: number; pValue: number; df: number } | null {
  const k = observedCounts.length;
  if (k < 2) return null;

  const total = observedCounts.reduce((s, c) => s + c, 0);
  if (total === 0) return null;

  const expected =
    expectedCounts ??
    observedCounts.map(() => total / k);

  if (expected.length !== k) return null;

  // No expected cell should be 0 (would cause division issues)
  if (expected.some((e) => e <= 0)) return null;

  let chi2 = 0;
  for (let i = 0; i < k; i++) {
    chi2 += (observedCounts[i] - expected[i]) ** 2 / expected[i];
  }

  const df = k - 1;

  // P-value: P(χ² > chi2) = 1 - CDF(chi2, df)
  // Use Wilson-Hilferty approximation for df >= 2
  // For df = 1: χ²_1 = Z², so P(χ²_1 > x) = 2*(1 - Φ(√x))
  let pValue: number;
  if (df === 1) {
    const z = Math.sqrt(chi2);
    pValue = 2 * (1 - cumulativeStdNormalProbability(z));
  } else {
    const mu = 1 - 2 / (9 * df);
    const sigma = Math.sqrt(2 / (9 * df));
    const z = (Math.pow(chi2 / df, 1 / 3) - mu) / sigma;
    pValue = 1 - cumulativeStdNormalProbability(z);
  }

  pValue = Math.max(0, Math.min(1, pValue));

  return { chi2, pValue, df };
}
