import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { SkippableAxiosConfig, WebUiHttpAuthConfig } from './types'
import { getSkipLoader } from './config'
import { notifyAxiosError } from './errorHandler'

function isAuthExcludedUrl(url: string | undefined, excluded: string[]): boolean {
  return url !== undefined && excluded.includes(url)
}

function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  tokenType: string,
  token: string
): void {
  config.headers.Authorization = `${tokenType} ${token}`
}

/** Attaches loader + JWT refresh interceptors to an axios instance. */
export function attachWebUiAuthInterceptors(
  axiosInstance: AxiosInstance,
  auth: WebUiHttpAuthConfig
): void {
  let isRefreshing = false
  let refreshPromise: Promise<unknown> | null = null

  const refreshAccessToken = async (): Promise<void> => {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = auth.refreshToken().finally(() => {
        isRefreshing = false
      })
    }
    await refreshPromise
  }

  axiosInstance.interceptors.request.use(
    async (config) => {
      const skipLoader = getSkipLoader(config as SkippableAxiosConfig)
      if (!skipLoader) {
        auth.showLoader()
      }

      if (config.url && isAuthExcludedUrl(config.url, auth.authExcludedUrls)) {
        return config
      }

      const identity = auth.readIdentity()
      const now = new Date()

      if (identity) {
        if (new Date(identity.expiresAt) < now) {
          if (new Date(identity.refreshTokenExpiresAt) > now) {
            await refreshAccessToken()
            const newIdentity = auth.readIdentity()
            if (newIdentity) {
              setAuthorizationHeader(config, newIdentity.tokenType, newIdentity.token)
            } else {
              auth.clearIdentity()
              if (!skipLoader) {
                auth.hideLoader()
              }
              return Promise.reject(new Error('Session expired. Please sign in again.'))
            }
          }
        } else {
          setAuthorizationHeader(config, identity.tokenType, identity.token)
        }
      }

      return config
    },
    (error: AxiosError) => {
      const skipLoader = getSkipLoader(error.config as SkippableAxiosConfig | undefined)
      if (!skipLoader) {
        auth.hideLoader()
      }
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
    (response) => {
      const skipLoader = getSkipLoader(response.config as SkippableAxiosConfig)
      if (!skipLoader) {
        auth.hideLoader()
      }
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as (SkippableAxiosConfig & InternalAxiosRequestConfig) | undefined

      const skipLoader = getSkipLoader(originalRequest)
      if (!skipLoader) {
        auth.hideLoader()
      }

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retryAfterRefresh &&
        !isAuthExcludedUrl(originalRequest.url, auth.authExcludedUrls)
      ) {
        const identity = auth.readIdentity()
        if (identity && new Date(identity.refreshTokenExpiresAt) > new Date()) {
          originalRequest._retryAfterRefresh = true
          try {
            await refreshAccessToken()
            const newIdentity = auth.readIdentity()
            if (newIdentity) {
              setAuthorizationHeader(originalRequest, newIdentity.tokenType, newIdentity.token)
              return axiosInstance(originalRequest)
            }
          } catch {
            auth.clearIdentity()
          }
        }
      }

      notifyAxiosError(error, auth.onErrorToast)
      return Promise.reject(error)
    }
  )
}
