import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr'
import { useEffect, useRef, useState } from 'react'

export type WebUiHubConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

export type WebUiHubAccessTokenFactory = () => string | undefined | Promise<string | undefined>

export interface UseWebUiHubOptions {
  /** Absolute URL or path (e.g. `/hubs/my-hub`). Paths resolve against `window.location.origin`. */
  hubUrl: string
  /** When false, no connection is opened. Default: true. */
  enabled?: boolean
  accessToken: WebUiHubAccessTokenFactory
  /** Hub method name -> handler. */
  events: Record<string, (payload: unknown) => void>
  automaticReconnect?: boolean
}

export interface UseWebUiHubResult {
  connectionState: WebUiHubConnectionState
  lastError: unknown
}

export const resolveHubUrl = (hubUrl: string): string => {
  if (/^https?:\/\//i.test(hubUrl))
    return hubUrl

  const base = typeof globalThis !== 'undefined' && 'location' in globalThis
    ? globalThis.location.origin
    : ''

  const path = hubUrl.startsWith('/') ? hubUrl : `/${hubUrl}`
  return `${base}${path}`
}

const eventKeys = (events: Record<string, unknown>): string =>
  Object.keys(events).sort().join('\0')

/** JWT-authenticated SignalR hub with reconnect handling. */
export const useWebUiHub = (options: UseWebUiHubOptions): UseWebUiHubResult => {
  const {
    hubUrl,
    enabled = true,
    accessToken,
    events,
    automaticReconnect,
  } = options

  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  const eventsRef = useRef(events)
  eventsRef.current = events

  const [connectionState, setConnectionState] = useState<WebUiHubConnectionState>(
    enabled ? 'connecting' : 'idle'
  )
  const [lastError, setLastError] = useState<unknown>(undefined)

  const subscribedEvents = eventKeys(events)

  useEffect(() => {
    if (!enabled) {
      setConnectionState('idle')
      setLastError(undefined)
      return
    }

    let disposed = false
    const wrappers = new Map<string, (payload: unknown) => void>()

    const builder = new HubConnectionBuilder()
      .withUrl(resolveHubUrl(hubUrl), {
        accessTokenFactory: async () => (await accessTokenRef.current()) ?? '',
      })

    if (automaticReconnect !== false)
      builder.withAutomaticReconnect()

    const connection = builder.build()

    for (const eventName of Object.keys(eventsRef.current)) {
      const wrapper = (payload: unknown) => eventsRef.current[eventName]?.(payload)
      wrappers.set(eventName, wrapper)
      connection.on(eventName, wrapper)
    }

    connection.onreconnecting(() => {
      if (!disposed)
        setConnectionState('reconnecting')
    })

    connection.onreconnected(() => {
      if (!disposed)
        setConnectionState('connected')
    })

    connection.onclose(error => {
      if (!disposed) {
        setConnectionState('disconnected')
        if (error)
          setLastError(error)
      }
    })

    setConnectionState('connecting')
    setLastError(undefined)

    void connection.start()
      .then(() => {
        if (!disposed)
          setConnectionState('connected')
      })
      .catch(error => {
        if (!disposed) {
          setConnectionState('disconnected')
          setLastError(error)
        }
      })

    return () => {
      disposed = true
      for (const [eventName, wrapper] of wrappers)
        connection.off(eventName, wrapper)

      if (connection.state === HubConnectionState.Connected
        || connection.state === HubConnectionState.Reconnecting) {
        void connection.stop()
      }
    }
  }, [enabled, hubUrl, subscribedEvents, automaticReconnect])

  return { connectionState, lastError }
}
