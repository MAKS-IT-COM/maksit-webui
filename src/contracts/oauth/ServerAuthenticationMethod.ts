/**
 * Mailbox server authentication method (OAuth2 vs login).
 * FiPlan/legacy FE shape — not in MaksIT.IdentityHub.Contracts.
 */
export enum ServerAuthenticationMethod {
  Default = 0,
  Login = 1,
  OAuth2 = 6,
}
