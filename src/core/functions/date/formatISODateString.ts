import { parseISO, isValid, format } from 'date-fns'

const DISPLAY_FORMAT = 'yyyy-MM-dd HH:mm'

/**
 * Formats an ISO-8601 date/time string for display in the UI.
 *
 * Uses `yyyy-MM-dd HH:mm` in local time via date-fns. Returns an empty string for
 * falsy input and a fixed error message when the string cannot be parsed.
 *
 * @param isoString - ISO date string from the API or form state.
 * @returns Formatted display string, empty string, or an invalid-date message.
 */
const formatISODateString = (isoString: string): string => {
  if (!isoString)
    return ''

  const parsed = parseISO(isoString)

  if (!isValid(parsed))
    return 'ISO Date String is invalid'

  return format(parsed, DISPLAY_FORMAT)
}

export {
  formatISODateString
}