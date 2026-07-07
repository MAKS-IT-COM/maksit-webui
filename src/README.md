# @maks-it.com/webui

Shared TypeScript contracts, utilities, hooks, and React components for MaksIT WebUI apps (Certs UI, Vault WebUI, CICD, and related products).

## Install

```bash
npm install @maks-it.com/webui
npm install react react-dom react-router-dom lucide-react @tanstack/react-table react-virtualized axios @microsoft/signalr zod
```

Peer dependencies must be installed in the host app.

## Contents

| Area | Examples |
|------|----------|
| Contracts | `PagedRequest`, `PatchOperation`, `LoginRequestSchema`, OAuth DTOs |
| Core | `deepDelta`, `useFormState`, `createWebUiHttpClient`, `useWebUiHub`, ACL parsers |
| Components | `DataTable`, `Layout`, editors, `ExternalLoginButtons`, `IdpLoginCallbackHandler` |

## Example — imports

```tsx
import {
  PatchOperation,
  deepDelta,
  deltaHasOperations,
  useFormState,
  DataTable,
  createColumns,
} from '@maks-it.com/webui'
```

## Example — PATCH delta

```ts
import { deepDelta, deltaHasOperations, ENTITY_SCOPES_ARRAY_POLICY } from '@maks-it.com/webui'

const delta = deepDelta(formState, backupState, {
  arrays: { entityScopes: ENTITY_SCOPES_ARRAY_POLICY },
})
if (deltaHasOperations(delta)) {
  await api.patch('/resource', delta)
}
```

## Repository

[github.com/MAKS-IT-COM/maksit-webui](https://github.com/MAKS-IT-COM/maksit-webui) — `src/`

## License

MIT
