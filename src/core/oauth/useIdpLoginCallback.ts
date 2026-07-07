import { useEffect } from 'react'
import type { LoginExternalExchangeResponse } from '@webui/contracts'
import { removeParamFromUrl } from './urlUtils'
import { shouldSkipIdpLoginCallback } from './idpOAuth'

export interface UseIdpLoginCallbackOptions {
  /**
   * Resolves context needed before redeem (e.g. tenant id for a product BFF).
   * Identity Hub `POST login-external/redeem` only requires `{ code }` — hosts may ignore extra args.
   */
  getTenantId: () => string | undefined
  redeemLogin: (code: string, tenantId: string) => Promise<LoginExternalExchangeResponse>
  onSuccess: (result: LoginExternalExchangeResponse) => void | Promise<void>
  onError: (error: unknown) => void
  onTenantMissing?: () => void
  maxWaitMs?: number
  pollIntervalMs?: number
}

const useIdpLoginCallback = ({
  getTenantId,
  redeemLogin,
  onSuccess,
  onError,
  onTenantMissing,
  maxWaitMs = 5000,
  pollIntervalMs = 250,
}: UseIdpLoginCallbackOptions) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code || shouldSkipIdpLoginCallback(params))
      return

    let waitedMs = 0
    const intervalId = setInterval(() => {
      const tenantId = getTenantId()

      if (tenantId) {
        clearInterval(intervalId)

        redeemLogin(code, tenantId)
          .then(async (result) => {
            removeParamFromUrl('code')
            await onSuccess(result)
          })
          .catch((err) => {
            removeParamFromUrl('code')
            onError(err)
          })
      }
      else {
        waitedMs += pollIntervalMs
        if (waitedMs >= maxWaitMs) {
          clearInterval(intervalId)
          onTenantMissing?.()
        }
      }
    }, pollIntervalMs)

    return () => clearInterval(intervalId)
  }, [getTenantId, redeemLogin, onSuccess, onError, onTenantMissing, maxWaitMs, pollIntervalMs])
}

export { useIdpLoginCallback }
