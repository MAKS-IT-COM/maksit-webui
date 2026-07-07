import { parseISO, isValid } from 'date-fns'



/**
 * Returns whether a string is a parseable ISO-8601 date/time value.
 *
 * Uses date-fns `parseISO` and `isValid`. Empty strings are treated as invalid.
 *
 * @param dateString - Candidate ISO date string.
 * @returns `true` when the string parses to a valid date.
 */
const isValidISODateString = (dateString: string): boolean => {
  if (!dateString) return false
  const parsed = parseISO(dateString)
  return isValid(parsed)
}



export {
  isValidISODateString
}