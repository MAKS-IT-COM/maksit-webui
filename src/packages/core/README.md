# @maks-it.com/webui-core

Shared utilities, HTTP helpers, and React hooks for MaksIT WebUI apps.

Depends on `@maks-it.com/webui-contracts`. Install peer dependencies in the host app: `react`, `axios`, `zod`.

## Install

```bash
npm install @maks-it.com/webui-core @maks-it.com/webui-contracts axios react zod
```

## Highlights

| Module | Exports |
|--------|---------|
| Deep diff | `deepDelta`, `deltaHasOperations`, collection policies |
| Deep utils | `deepCopy`, `deepEqual`, `deepMerge`, `deepPatternMatch` |
| Forms | `useFormState`, `validateFormState`, `applyFormFieldChange`, `createFormFieldUpdater` |
| DataTable | `mapPagedToDataTable`, `extractPropFilter`, `DataTablePageView` |
| ACL | `parseAclEntry`, `parseAclEntries` |
| HTTP | `createWebUiHttpClient`, auth interceptors, Problem Details helpers |
| Enum / flags | `enumToArr`, `flagsToString`, `hasFlag`, `toggleFlag` |
| Identity storage | `readIdentity`, `writeIdentity`, `removeIdentity` |

## Example — form state

```tsx
import { z } from 'zod'
import { useFormState } from '@maks-it.com/webui-core'

const schema = z.object({ name: z.string().min(1) })

function MyForm() {
  const { formState, errors, formIsValid, handleInputChange } = useFormState({
    initialState: { name: '' },
    validationSchema: schema,
  })
  // ...
}
```

## Example — PATCH delta

```ts
import { deepDelta, deltaHasOperations } from '@maks-it.com/webui-core'

const delta = deepDelta(formState, backupState, { arrays: { items: { identityKey: 'id' } } })
if (deltaHasOperations(delta)) {
  await api.patch('/resource', delta)
}
```

## Repository

[github.com/MAKS-IT-COM/maksit-webui](https://github.com/MAKS-IT-COM/maksit-webui) — `src/packages/core`

## License

MIT
