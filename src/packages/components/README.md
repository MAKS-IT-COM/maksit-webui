# @maks-it.com/webui-components

Shared React UI components for MaksIT WebUI apps: forms, DataTable, layout, editors, and list views.

Depends on `@maks-it.com/webui-core` and `@maks-it.com/webui-contracts`. Peer dependencies must be installed in the host app.

## Install

```bash
npm install @maks-it.com/webui-components @maks-it.com/webui-core @maks-it.com/webui-contracts
npm install react react-dom react-router-dom lucide-react @tanstack/react-table react-virtualized zod
```

## Components

| Export | Purpose |
|--------|---------|
| `DataTable`, `DataTableFilter`, `DataTableLabel` | Virtualized server-paged tables |
| `RemoteSelectBoxComponent` | Async search select (pass `searchRoute` API path) |
| `SecretComponent` | Secret field with optional generate action |
| `FormContainer`, `FormHeader`, `FormContent`, `FormFooter` | Form layout shell |
| `Layout` | App chrome / navigation wrapper |
| `Offcanvas` | Slide-over panel |
| `LazyLoadTable` | Incrementally loaded table |
| `EntityScopesSummary` | Entity scope permissions summary |
| `Toast`, `addToast` | Toast notifications |
| `FieldContainer` | Label + validation wrapper for fields |

## Example — DataTable

```tsx
import { DataTable, createColumns } from '@maks-it.com/webui-components'

const columns = createColumns([
  { key: 'name', header: 'Name' },
  { key: 'createdAt', header: 'Created', label: 'date' },
])

<DataTable
  columns={columns}
  rawd={pagedResponse}
  onPageChange={setPage}
/>
```

## Example — remote select

```tsx
import { RemoteSelectBoxComponent } from '@maks-it.com/webui-components'

<RemoteSelectBoxComponent
  searchRoute="/api/users/search"
  value={userId}
  onChange={setUserId}
  labelKey="name"
/>
```

## Repository

[github.com/MAKS-IT-COM/maksit-webui](https://github.com/MAKS-IT-COM/maksit-webui) — `src/packages/components`

## License

MIT
