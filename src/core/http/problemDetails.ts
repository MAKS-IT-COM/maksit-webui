import type { ProblemDetails } from '@webui/contracts'

/** Builds a user-facing message from RFC 7807 problem details. */
export function formatProblemDetailsMessage(problem: ProblemDetails): string {
  const detail = problem.detail ?? ''
  const errors = problem.errors
    ? Object.entries(problem.errors)
        .flatMap(([key, msgs]) => (msgs ?? []).map((m) => `${key}: ${m}`))
        .join('; ')
    : ''
  return [detail, errors].filter(Boolean).join(' ') || problem.title || 'Request failed'
}
