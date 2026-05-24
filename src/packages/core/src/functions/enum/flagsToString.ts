import { enumToArr } from './enumToArr'

/**
 * Formats a bit-flag enum value as a comma-separated list of set flag names.
 *
 * Flag value `0` is excluded from the output. Returns `"None"` when no flags are set.
 *
 * @param enumType - Runtime flags enum (each member is a power-of-two bit).
 * @param flags - Combined bitmask to decode.
 * @returns Comma-separated display names, or `"None"`.
 */
const flagsToString = <T>(enumType: T, flags: number): string => {
  return enumToArr(enumType)
    .filter(opt => (flags & opt.value as number) === opt.value && opt.value !== 0)
    .map(opt => opt.displayValue)
    .join(', ') || 'None'
}

export { flagsToString }