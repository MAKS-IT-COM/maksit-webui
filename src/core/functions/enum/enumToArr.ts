/** `{ value, displayValue }` pair for populating select/dropdown options from a TypeScript enum. */
export interface EnumArrayProps {
    value: number | string;
    displayValue: string;
}


/**
 * Converts a TypeScript enum into a sorted array of `{ value, displayValue }` options.
 *
 * Skips numeric reverse-mapping keys for numeric enums and deduplicates string enums
 * that emit duplicate values. Results are sorted by `displayValue` (enum key name).
 *
 * @param enumType - Runtime enum object (numeric or string enum).
 * @returns Dropdown-ready options, or an empty array when `enumType` is falsy.
 */
const enumToArr = (enumType: unknown): EnumArrayProps[] => {
  if (!enumType) return []

  const enumEntries = Object.entries(enumType)
  const addedValues = new Set()
  const result: EnumArrayProps[] = []

  enumEntries.forEach(([key, value]) => {
    // Skip numeric keys to avoid reverse mapping duplicates in numeric enums
    if (!isNaN(Number(key))) return

    // Skip already added values for string enums with reverse mapping
    if (addedValues.has(value)) return
    addedValues.add(value)

    result.push({
      value: value,
      displayValue: key,
    })
  })

  // Sort the result array by displayValue (key)
  result.sort((a, b) => {
    if (typeof a.displayValue === 'string' && typeof b.displayValue === 'string') {
      return a.displayValue.localeCompare(b.displayValue)
    }
    return 0
  })

  return result
}

export { enumToArr }
