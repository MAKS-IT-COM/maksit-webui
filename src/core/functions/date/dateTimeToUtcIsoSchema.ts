import { parseISO, isValid } from 'date-fns'
import { z } from 'zod'

const INVALID_DATE_MESSAGE = 'Invalid date/time'

/**
 * Zod schema that accepts a local datetime string (e.g. from `<input type="datetime-local">`)
 * or an ISO string with or without offset, and transforms it to a UTC ISO string for the API.
 *
 * Uses date-fns for parsing and validation, consistent with {@link isValidISODateString}
 * and {@link formatISODateString}. Emits `"Invalid date/time"` when parsing fails.
 */
export const dateTimeToUtcIsoSchema = z
  .string()
  .refine(
    (value) => {
      const parsed = parseISO(value)
      return isValid(parsed)
    },
    { message: INVALID_DATE_MESSAGE }
  )
  .transform((value) => {
    const parsed = parseISO(value)
    return parsed.toISOString()
  })
