import { useEffect, useRef } from 'react'
import {
  EmailProtocol,
  MAILBOX_OAUTH_PROCESSING_KEY_PREFIX,
  MAILBOX_OAUTH_QUERY_FLAG,
  MAILBOX_OAUTH_STORAGE_KEY,
  type MailboxOAuthPending,
} from '@webui/contracts'
import {
  clearMailboxOAuthPending,
  mailboxOAuthRedirectHost,
  saveMailboxOAuthPending,
} from './mailboxOAuth'
import { removeParamsFromUrl } from './urlUtils'

const MAILBOX_OAUTH_CLEAN_PARAMS = ['code', MAILBOX_OAUTH_QUERY_FLAG, 'error', 'error_description'] as const

export interface MailboxOAuthApi {
  getOAuth2LoginUrl: (mailboxId: number, redirectHost: string) => Promise<string>
  redeemMsal: (mailboxId: number, code: string, emailProtocol: EmailProtocol) => Promise<unknown>
}

export interface UseMailboxOAuthReturnOptions {
  api: MailboxOAuthApi
  isAuthenticated: () => boolean
  onSuccess?: (message?: string) => void
  onError?: (message: string) => void
  successMessage?: string
  errorMessage?: string
}

const useMailboxOAuthReturn = ({
  api,
  isAuthenticated,
  onSuccess,
  onError,
  successMessage = 'Mailbox OAuth2 authentication completed.',
  errorMessage = 'Mailbox OAuth2 authentication failed.',
}: UseMailboxOAuthReturnOptions) => {
  const handled = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get(MAILBOX_OAUTH_QUERY_FLAG) !== '1' || handled.current)
      return

    handled.current = true

    const cleanParams = () => removeParamsFromUrl([...MAILBOX_OAUTH_CLEAN_PARAMS])

    const goBack = (returnPath: string) => {
      clearMailboxOAuthPending()
      cleanParams()

      const path = returnPath.startsWith('/')
        ? returnPath
        : `/${returnPath}`

      window.location.replace(`${window.location.origin}${window.location.pathname}#${path}`)
    }

    const oauthError = params.get('error')
    if (oauthError) {
      const pendingRaw = sessionStorage.getItem(MAILBOX_OAUTH_STORAGE_KEY)

      clearMailboxOAuthPending()
      cleanParams()

      onError?.(decodeURIComponent((params.get('error_description') ?? oauthError).replace(/\+/g, ' ')))

      if (pendingRaw) {
        try {
          goBack((JSON.parse(pendingRaw) as MailboxOAuthPending).returnPath ?? '/')
        }
        catch {
          goBack('/')
        }
      }

      return
    }

    const code = params.get('code')
    if (!code || !isAuthenticated())
      return

    const processingKey = `${MAILBOX_OAUTH_PROCESSING_KEY_PREFIX}${code}`

    if (sessionStorage.getItem(processingKey))
      return

    try {
      sessionStorage.setItem(processingKey, '1')
    }
    catch {
      /* ignore */
    }

    const raw = sessionStorage.getItem(MAILBOX_OAUTH_STORAGE_KEY)
    if (!raw) {
      try {
        sessionStorage.removeItem(processingKey)
      }
      catch {
        /* ignore */
      }

      cleanParams()
      return
    }

    let pending: MailboxOAuthPending
    try {
      pending = JSON.parse(raw) as MailboxOAuthPending
    }
    catch {
      try {
        sessionStorage.removeItem(processingKey)
        sessionStorage.removeItem(MAILBOX_OAUTH_STORAGE_KEY)
      }
      catch {
        /* ignore */
      }

      cleanParams()
      return
    }

    const protocol = pending.protocols[0]
    const remaining = pending.protocols.slice(1)

    api.redeemMsal(pending.mailboxId, code, protocol)
      .then(() => {
        cleanParams()

        if (remaining.length > 0) {
          const nextPending: MailboxOAuthPending = { ...pending, protocols: remaining }
          saveMailboxOAuthPending(nextPending)

          return api
            .getOAuth2LoginUrl(pending.mailboxId, mailboxOAuthRedirectHost())
            .then((loginUrl) => {
              window.location.href = loginUrl
            })
        }

        clearMailboxOAuthPending()
        onSuccess?.(successMessage)
        goBack(pending.returnPath)
      })
      .catch(() => {
        try {
          sessionStorage.removeItem(processingKey)
          sessionStorage.removeItem(MAILBOX_OAUTH_STORAGE_KEY)
        }
        catch {
          /* ignore */
        }

        cleanParams()
        onError?.(errorMessage)
        goBack(pending.returnPath)
      })
  }, [api, isAuthenticated, onSuccess, onError, successMessage, errorMessage])
}

export { useMailboxOAuthReturn }
