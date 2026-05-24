import type { FormValidationIssue } from '../../types/FormValidationSchema'
import type { FormPath } from './formPath'

/**
 * Maps validation issues to a flat field-path → error message record.
 *
 * Each issue's `path` segments are joined with `.` to match {@link FormPath} keys.
 *
 * @param issues - Issues from a failed schema `safeParse`.
 * @returns Partial map of field paths to error messages.
 */
const flattenFormValidationIssues = <T extends Record<string, unknown>>(
  issues: FormValidationIssue[]
): Partial<Record<FormPath<T>, string>> => {
  const acc: Partial<Record<FormPath<T>, string>> = {}

  for (const issue of issues) {
    const path = issue.path.map(String).join('.') as FormPath<T>
    acc[path] = issue.message
  }

  return acc
}

export {
  flattenFormValidationIssues
}
