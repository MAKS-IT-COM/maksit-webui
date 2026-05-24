/**
 * Reads the first `Prop.Contains|StartsWith|EndsWith("…")` value from a combined
 * LINQ-style filter string (e.g. Certs sends the extracted substring as `PagedRequest.filters`).
 *
 * @param combined - Full filter expression from the DataTable, or `undefined` when empty.
 * @param propName - Property name to match (e.g. `"CommonName"`).
 * @returns The captured substring inside the first matching predicate, or `undefined`.
 */
export function extractPropFilter(combined: string | undefined, propName: string): string | undefined {
  if (!combined?.trim()) return undefined
  const re = new RegExp(`${propName}\\.(?:Contains|StartsWith|EndsWith)\\("([^"]*)"`, 'i')
  const m = combined.match(re)
  return m?.[1]
}
