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
| Core | `deepDelta`, `useFormState`, `useLocalStorage`, `useSessionStorage`, `useOnScreen`, `useInterval`, `usePrevious`, `useLongPress`, `useDebounce`, `useOnClickOutside`, `useMedia`, `useHover`, `createWebUiHttpClient`, `useWebUiHub`, ACL parsers |
| Components | `DataTable`, `FileBrowser` (create/upload/download hooks), `Modal`, `Loader`, `Masonry`, `LightBox`, `CookieConsent`, `Ratings`, social chat buttons, `Layout`, editors, OAuth UI |

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

**Request DTOs** that extend `RequestModelBase` (or `PatchRequestModelBase` for PATCH) must use the matching base Zod schema — `RequestModelBaseSchema` or `PatchRequestModelBaseSchema` — not a plain `z.object({...})`. Otherwise `safeParse` strips unknown keys (including PATCH `operations`). Response DTOs only need the `ResponseModelBase` TypeScript marker; there is no response base schema.

```ts
import { RequestModelBaseSchema, PatchRequestModelBaseSchema } from '@maks-it.com/webui'

export const CreateEntityRequestSchema = RequestModelBaseSchema.and(
  z.object({ name: z.string().min(1) }),
)

export const PatchEntityScopeRequestSchema = PatchRequestModelBaseSchema.and(
  z.object({
    id: z.string().optional(),
    _deltaId: z.string().optional(),
    entityId: z.string().optional(),
    entityType: z.number().optional(),
    scope: z.number().optional(),
  }),
)
```

## Repository

[github.com/MAKS-IT-COM/maksit-webui](https://github.com/MAKS-IT-COM/maksit-webui) — `src/`

## License

MIT
