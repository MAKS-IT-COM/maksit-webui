export const getCookie = (name: string): string => {
  if (typeof document === 'undefined')
    return ''

  const prefix = `${name}=`
  const parts = decodeURIComponent(document.cookie).split(';')

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix))
      return trimmed.substring(prefix.length)
  }

  return ''
}

export const setCookie = (
  name: string,
  value: string,
  days: number,
  domain?: string,
): void => {
  if (typeof document === 'undefined')
    return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

  const domainPart = domain ? `; domain=${domain}` : ''
  document.cookie = `${name}=${encodeURIComponent(value)}${domainPart}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}
