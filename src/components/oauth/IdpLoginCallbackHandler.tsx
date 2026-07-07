import type { FC } from 'react'
import { useIdpLoginCallback, type UseIdpLoginCallbackOptions } from '@webui/core'

export type IdpLoginCallbackHandlerProps = UseIdpLoginCallbackOptions

const IdpLoginCallbackHandler: FC<IdpLoginCallbackHandlerProps> = (props) => {
  useIdpLoginCallback(props)
  return null
}

export { IdpLoginCallbackHandler }
export type { LoginExternalExchangeResponse } from '@webui/contracts'
/** @deprecated Use `LoginExternalExchangeResponse`. */
export type { IdpRedeemLoginResponse } from '@webui/contracts'
