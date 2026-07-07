import { EnumArrayProps, enumToArr } from './enumToArr'

/**
 * Resolves a numeric enum member to its {@link EnumArrayProps} metadata entry.
 *
 * @param enumType - Runtime enum object.
 * @param enumValue - Numeric enum value to look up.
 * @returns Matching option metadata, or `undefined` when not found.
 */
const getEnumValue = <T>(enumType: T, enumValue: number) : EnumArrayProps | undefined => {
  return enumToArr(enumType).find((item) => item.value == enumValue)
}

/**
 * Formats a numeric enum value as `"value - DisplayName"` for read-only UI labels.
 *
 * Returns an empty string when `enumValue` is `null`/`undefined` or not found in the enum.
 *
 * @param enumType - Runtime enum object.
 * @param enumValue - Numeric value to format.
 * @returns Human-readable label, or `''` when the value cannot be resolved.
 */
const enumToString = <T>(enumType: T, enumValue?: number | null): string => {

  if (enumValue === undefined || enumValue === null) {
    return ''
  }

  const enumVal = getEnumValue(enumType, enumValue)

  if (!enumVal)
    return ''

  return `${enumVal.value} - ${enumVal.displayValue}`
}

export {
  enumToString
}