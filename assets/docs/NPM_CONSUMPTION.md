# Consuming @maksit/webui-* in Certs UI / Vault

Install:

```bash
npm install @maksit/webui-contracts @maksit/webui-core @maksit/webui-components
```

Wrap the app:

```tsx
import { WebUiProvider, Loader, Authorization } from '@maksit/webui-components'

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

## API differences vs copied local folders

- `RemoteSelectBoxComponent`: use `searchRoute` (absolute API path string) instead of `apiRoute: ApiRoutes`.
- `SecretComponent`: pass `generateSecretRoute` when `enableGenerate` is true.
- ACL: generic `parseAclEntry` / `parseAclEntries` from `@maksit/webui-core`; per-app entity maps and `parse*AclEntries` live in each WebUI project (`models/acl.ts`).
- Identity request types and Zod schemas (`LoginRequest` + `LoginRequestSchema`, `LogoutRequest` + `LogoutRequestSchema`, `RefreshTokenRequest` + `RefreshTokenRequestSchema`) live in `@maksit/webui-contracts`.
