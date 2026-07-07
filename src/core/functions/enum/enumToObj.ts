
/**
 * Converts a TypeScript enum into a plain key → value record.
 *
 * Numeric reverse-mapping keys are omitted so each logical member appears once.
 *
 * @param enumType - Runtime enum object.
 * @returns Object map of enum member names to values, or `{}` when `enumType` is falsy.
 */
const enumToObj = (enumType: unknown) => {
  if (!enumType) return {}

  const enumEntries = Object.entries(enumType)
  const result: { [key: string]: number | string } = {}

  enumEntries.forEach(([key, value]) => {
    // Skip numeric keys to avoid reverse mapping duplicates in numeric enums
    if (!isNaN(Number(key))) return
    result[key] = value
  })

  return result
}

export { enumToObj }