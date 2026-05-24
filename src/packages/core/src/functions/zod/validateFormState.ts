import type { FormValidationSchema } from '../../types/FormValidationSchema'
import { emptyFormErrors } from './emptyFormErrors'
import { flattenFormValidationIssues } from './flattenFormValidationIssues'

/**
 * Validates form state against a Zod-agnostic schema and returns UI-ready results.
 *
 * Wraps {@link FormValidationSchema.safeParse} and normalizes errors for display.
 * Used by {@link useFormState} and callable directly in non-React code paths.
 *
 * @param formState - Current form values.
 * @param validationSchema - Schema exposing `safeParse` (typically a Zod schema).
 * @returns Field errors, validity flag, and the raw parse result.
 */
const validateFormState = <T extends Record<string, unknown>>(
  formState: T,
  validationSchema: FormValidationSchema<T>
) => {
  const validationResult = validationSchema.safeParse(formState)

  const errors = validationResult.success
    ? emptyFormErrors(formState)
    : flattenFormValidationIssues<T>(validationResult.error.issues)

  return {
    errors,
    formIsValid: validationResult.success,
    validationResult
  }
}

export {
  validateFormState
}
