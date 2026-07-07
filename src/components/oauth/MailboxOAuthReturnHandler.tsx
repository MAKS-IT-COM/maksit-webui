import type { FC } from 'react'
import { useMailboxOAuthReturn, type UseMailboxOAuthReturnOptions } from '@webui/core'

export type MailboxOAuthReturnHandlerProps = UseMailboxOAuthReturnOptions

const MailboxOAuthReturnHandler: FC<MailboxOAuthReturnHandlerProps> = (props) => {
  useMailboxOAuthReturn(props)
  return null
}

export { MailboxOAuthReturnHandler }
