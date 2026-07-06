# @maks-it.com/webui-contracts

Shared TypeScript contracts and Zod schemas for MaksIT WebUI apps (Certs UI, Vault WebUI, and related products).

## Install

```bash
npm install @maks-it.com/webui-contracts zod
```

`zod` is a peer dependency (schemas use Zod v4).

## Contents

| Area | Exports |
|------|---------|
| Paging | `PagedRequest`, `PagedRequestSchema`, `PagedResponse` |
| PATCH | `PatchOperation`, `PatchRequestModelBase`, `PatchRequestModelBaseSchema` |
| API errors | `ProblemDetails` |
| Search | `SearchResponseBase`, `SearchEntityScopeEntry` |
| Identity | `LoginRequest` / `LoginRequestSchema`, `LoginResponse`, `RefreshTokenRequest`, `LogoutRequest`, `Claims` |
| OAuth / IdP | `LoginProviderExternal`, `EmailProtocol`, `ServerAuthenticationMethod`, `IdpRedeemLoginResponse`, `MailboxOAuthPending`, mailbox OAuth constants |
| Misc | `TrngResponse`, `RequestModelBase`, `ResponseModelBase` |

## Example

```ts
import {
  LoginRequestSchema,
  type PagedRequest,
  PatchOperation,
} from '@maks-it.com/webui-contracts'

const login = LoginRequestSchema.parse({ username: 'admin', password: '***' })

const page: PagedRequest = {
  pageNumber: 1,
  pageSize: 25,
  filters: 'Name.Contains("cert")',
}
```

## Repository

[github.com/MAKS-IT-COM/maksit-webui](https://github.com/MAKS-IT-COM/maksit-webui) — `src/packages/contracts`

## License

MIT
