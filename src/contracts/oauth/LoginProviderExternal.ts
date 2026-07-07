/**
 * External identity provider for Identity Hub login (`login-external/challenge`).
 * Values match `MaksIT.IdentityHub.Engine.LoginProviderExternal` names (`Microsoft`, `Google`).
 */
export enum LoginProviderExternal {
  Microsoft = 'Microsoft',
  Google = 'Google',
}

export const toAuthProviderName = (provider: LoginProviderExternal): string => provider

export const tryParseLoginProviderExternal = (
  value: string | null | undefined,
): LoginProviderExternal | undefined => {
  if (!value)
    return undefined

  const normalized = value.trim()
  if (normalized === LoginProviderExternal.Google || normalized === LoginProviderExternal.Microsoft)
    return normalized

  return undefined
}
