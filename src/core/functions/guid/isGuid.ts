/**
 * Tests whether a string is a canonical GUID/UUID (8-4-4-4-12 hex segments).
 *
 * @param guid - String to validate (case-insensitive).
 * @returns `true` when the string matches the GUID format.
 */
const isGuid = (guid: string): boolean => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return guidRegex.test(guid)
}

export {
  isGuid
}
