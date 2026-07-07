# Consuming `@maks-it.com/webui` in Certs UI / Vault

Install:

```bash
npm install @maks-it.com/webui
npm install react react-dom react-router-dom lucide-react @tanstack/react-table react-virtualized axios @microsoft/signalr zod
```

Example imports:

```tsx
import {
  WebUiProvider,
  Loader,
  Authorization,
  DataTable,
  createColumns,
  deepDelta,
  PatchOperation,
} from '@maks-it.com/webui'
```

Wrap the app:

```tsx
<WebUiProvider
  api={{
    getData: (url) => getData(url),
    getDataWithoutLoader: (url) => getDataWithoutLoader(url),
    postData: (url, body) => postData(url, body),
    postDataWithoutLoader: (url, body) => postDataWithoutLoader(url, body),
  }}
  loader={{
    disableLoader: () => dispatch(disableLoader()),
    enableLoader: () => dispatch(enableLoader()),
  }}
  auth={{
    identity,
    hydrated,
    login: (c) => dispatch(login(c)),
    logout: (r) => dispatch(logout(r)),
    setIdentityFromLocalStorage: () => dispatch(setIdentityFromLocalStorage()),
    showUserOffcanvas,
    setShowUserOffcanvas: () => dispatch(setShowUserOffcanvas()),
    setHideUserOffcanvas: () => dispatch(setHideUserOffcanvas()),
  }}
  loading={loading}
>
  <Loader />
  <Authorization>{/* routes */}</Authorization>
</WebUiProvider>
```

## Migration from `@maks-it.com/webui-*`

Replace three package installs with one:

```diff
- npm install @maks-it.com/webui-contracts @maks-it.com/webui-core @maks-it.com/webui-components
+ npm install @maks-it.com/webui
```

Update imports:

```diff
- import { PatchOperation } from '@maks-it.com/webui-contracts'
- import { deepDelta } from '@maks-it.com/webui-core'
- import { DataTable } from '@maks-it.com/webui-components'
+ import { PatchOperation, deepDelta, DataTable } from '@maks-it.com/webui'
```

## API notes

- `RemoteSelectBoxComponent`: use `searchRoute` (absolute API path string) instead of `apiRoute: ApiRoutes`.
- `SecretComponent`: pass `generateSecretRoute` when `enableGenerate` is true.
- ACL: generic `parseAclEntry` / `parseAclEntries` from `@maks-it.com/webui`; per-app entity maps and `parse*AclEntries` live in each WebUI project (`models/acl.ts`).
- Identity request types and Zod schemas (`LoginRequest` + `LoginRequestSchema`, `LogoutRequest` + `LogoutRequestSchema`, `RefreshTokenRequest` + `RefreshTokenRequestSchema`) are exported from `@maks-it.com/webui`.
