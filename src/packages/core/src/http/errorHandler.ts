import type { AxiosError } from 'axios'
import type { ProblemDetails } from '@maksit/webui-contracts'
import { formatProblemDetailsMessage } from './problemDetails'

/** Shows toast(s) for problem+json and 401 responses. */
export function notifyAxiosError(
  error: AxiosError,
  onErrorToast?: (message: string) => void
): void {
  if (!onErrorToast || !error.response) {
    return
  }

  const contentType = error.response.headers['content-type']
  const data = error.response.data

  if (contentType && String(contentType).includes('application/problem+json')) {
    onErrorToast(formatProblemDetailsMessage(data as ProblemDetails))
    return
  }

  if (error.response.status === 401) {
    const problem = data as ProblemDetails
    onErrorToast(problem.detail ?? problem.title ?? 'Unauthorized')
  }
}
