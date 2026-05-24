/** Per-request flags carried on axios config (see `SkippableAxiosConfig`). */
export interface RequestOptions {
  skipLoader?: boolean
}

export interface ApiResponse<T> {
  payload: T | undefined
  status: number | undefined
  ok: boolean
}

export interface SkippableAxiosConfig {
  skipLoader?: boolean
  _retryAfterRefresh?: boolean
}

export interface WebUiStoredIdentity {
  tokenType: string
  token: string
  expiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface WebUiHttpAuthConfig {
  readIdentity: () => WebUiStoredIdentity | undefined
  refreshToken: () => Promise<unknown>
  clearIdentity: () => void
  showLoader: () => void
  hideLoader: () => void
  /** Login/refresh URLs — no bearer token attached. */
  authExcludedUrls: string[]
  onErrorToast?: (message: string) => void
}

export interface CreateWebUiHttpClientOptions {
  timeout?: number
  auth: WebUiHttpAuthConfig
}

export interface BinaryPayload {
  data: ArrayBuffer | Blob
  headers: Record<string, string>
}
