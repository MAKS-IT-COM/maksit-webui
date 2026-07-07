/** Minimal validation issue shape (compatible with Zod, no zod import). */
export interface FormValidationIssue {
  path: PropertyKey[]
  message: string
}

export type FormValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: FormValidationIssue[] } }

/**
 * Zod-agnostic schema surface for {@link useFormState} and {@link validateFormState}.
 * Avoids duplicate-`zod` TypeScript errors when apps and packages resolve different copies.
 */
export interface FormValidationSchema<T> {
  safeParse: (data: unknown) => FormValidationResult<T>
}
