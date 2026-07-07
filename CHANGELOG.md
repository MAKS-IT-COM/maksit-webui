# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-07-07

### Changed

- **Breaking:** merged `@maks-it.com/webui-contracts`, `@maks-it.com/webui-core`, and `@maks-it.com/webui-components` into a single published package **`@maks-it.com/webui`**. Host apps install one package and import everything from `@maks-it.com/webui` (see `assets/docs/NPM_CONSUMPTION.md` migration notes).
- **Breaking:** `src/` is now the npm package root — `src/package.json` publishes as `@maks-it.com/webui`; npm workspaces and `src/packages/*` nesting removed.
- Source layout: `contracts/`, `core/`, and `components/` live directly under `src/` (internal organization only; no subpath exports).
- Release pipeline (`utils/engines/release/scriptSettings.json`) publishes one package; `NpmReleaseVersion.syncWorkspaceVersions` disabled.
- Jest, Vitest, and Storybook configs updated for the flat `src/` layout (`@webui/*` aliases point at `src/{contracts,core,components}`).
- VS Code/Cursor: TypeScript SDK and integrated terminal default to `src/`.
- `src/coverage/` explicitly gitignored; generated coverage is no longer tracked (README badges remain under `assets/badges/`).

### Removed

- `@maks-it.com/webui-contracts`, `@maks-it.com/webui-core`, and `@maks-it.com/webui-components` as separate npm packages (superseded by `@maks-it.com/webui`).
- `src/packages/` workspace layout and per-package `package.json` files.
- Repo-root `tsconfig.json` and stray `node_modules/` (tooling and dependencies live under `src/` only).

## [0.3.5] - 2026-07-06

### Fixed

- `ENTITY_SCOPES_ARRAY_POLICY`: synthetic identity is now `{entityId}-{entityType}` (not including `scope`), so adding an application scope alongside an existing organization scope produces a correct `AddToCollection` delta, and permission changes on id-less rows update in place via `_deltaId`.

## [0.3.4] - 2026-07-06

### Added

- **OAuth / external identity providers** (extracted from FiPlan.Anywhere):
  - `@maks-it.com/webui-contracts`: `LoginProviderExternal`, `EmailProtocol`, `ServerAuthenticationMethod`, `MsalViewModel`, `IdpRedeemLoginResponse`, `MailboxOAuthPending`, and mailbox OAuth session/query constants.
  - `@maks-it.com/webui-core`: `startIdpRedirect`, `shouldSkipIdpLoginCallback`, `useIdpLoginCallback`, mailbox OAuth redirect helpers (`collectMailboxOAuthProtocols`, `startMailboxOAuthRedirect`, `useMailboxOAuthReturn`), and `removeParamFromUrl` / `removeParamsFromUrl`.
  - `@maks-it.com/webui-components`: `ExternalLoginButtons`, `IdpLoginCallbackHandler`, `MailboxOAuthReturnHandler`.
- `@maks-it.com/webui-core`: `HOSTNAMES_ARRAY_POLICY` for Certs UI account hostname PATCH collections (`identityKey` / `idFieldKey`: `hostname`).
- `deepDelta` regression tests for Certs/Vault consumer forms — `HOSTNAMES_ARRAY_POLICY`, `ENTITY_SCOPES_ARRAY_POLICY`, `VERSIONS_ARRAY_POLICY`, advanced `ArrayPolicy` options (`rootKey`, `childArrayKeys`, `deleteItemWhenRoleRemoved`).

### Changed

- All `@maks-it.com/webui-*` packages versioned at **0.3.4** with aligned workspace dependency ranges.
- RepoUtils entry points and docs: `utils/src/` → `utils/` (`Invoke-TestEngine.bat`, `Invoke-ReleasePackage-Single.bat`, `Update-RepoUtils.bat`; README and `assets/docs/NPM_PUBLISH.md` updated).
- Release secret env vars documented as logical names **`Npm`** and **`GitHub`** (see `utils/engines/release/scriptSettings.json`).
- Package READMEs document OAuth exports and PATCH collection policies.

### Fixed

- `deepDelta` identifiable-array diff: role-null removals emit the correct identity field (`id` vs `_deltaId`); item deltas are omitted when only `operations` changed (no spurious id-only placeholders).

## [0.3.3] - 2026-05-31

### Changed

- Migrated `utils/` to maksit-repoutils **1.0.14** layout under `utils/src/` (`Invoke-ReleasePackage`, `Invoke-TestEngine`, `Update-RepoUtils`). Product `scriptSettings.json` paths updated for the deeper engine folders.

### Added

- `@maks-it.com/webui-core`: `useWebUiHub` React hook for JWT-authenticated SignalR hubs — connection state (`idle` / `connecting` / `connected` / `reconnecting` / `disconnected`), optional automatic reconnect, and typed hub event handlers.
- `resolveHubUrl` helper (absolute URLs unchanged; relative paths resolve against `window.location.origin`).
- `@microsoft/signalr` peer dependency on `@maks-it.com/webui-core`.

### Changed

- All `@maks-it.com/webui-*` packages published at `0.3.3` with aligned workspace dependency ranges.
- Jest tests for core and contracts moved from co-located `src/**/*.test.ts` to `packages/*/test/`; root `jest.config.cjs` roots updated accordingly.
- `@maks-it.com/webui-core` README documents SignalR install and `useWebUiHub` usage.

## [0.3.2] - 2026-05-30

### Fixed

- Disabled and read-only editors now show consistent muted styling: `CheckBoxComponent` uses `opacity-50` when disabled; `FieldContainer` grays field labels when inactive; checkbox, radio, text, select, date, and secret fields share `getInactiveControlClasses()`.
- Added `tsup` to workspace root `devDependencies` so `npm ci` + `npm run build` resolve the CLI on Windows (subpackage-only hoisting was not always on `PATH` for nested workspace scripts).

### Added

- Storybook **Disabled** story for `CheckBoxComponent`.

## [0.3.1] - 2026-05-30

### Fixed

- Toast IDs no longer use `crypto.randomUUID()` (requires HTTPS/localhost). IDs are generated with a counter + timestamp via `createToastId()` so toasts work over HTTP in Docker and other non-secure contexts.

### Changed

- `@maks-it.com/webui-components`: shared helpers (`debounce`, `colSpanClass`, `GridColSpan`) are imported from the `functions` barrel instead of subpaths.
- `@maks-it.com/webui-core`: re-exports `date-fns` primitives (`parseISO`, `formatISO`, `format`, `getDaysInMonth`, `addMonths`, `subMonths`) for consumers.
- `@maks-it.com/webui-components` `DateTimePickerComponent` imports date helpers from `@maks-it.com/webui-core` instead of `date-fns` directly.

### Removed

- `lodash` and `@types/lodash` from `@maks-it.com/webui-components`; filter debouncing uses a local `debounce()` helper.
- Duplicate `date-fns` dependency from `@maks-it.com/webui-components` (`date-fns` remains on `@maks-it.com/webui-core` only).

## [0.3.0] - 2026-05-25

### Added

- Storybook 10 catalog for `@maks-it.com/webui-components`: Tailwind v4, React Router decorator, autodocs, a11y addon, stories for all editors, DataTable (with **ClientSideInteractive** filters/pagination demo), Layout, and FormLayout (`FormContainer`, `FormHeader`, `FormContent`, `FormFooter`).
- `npm run storybook` and `npm run build-storybook` from `src/`.

### Changed

- Storybook stories under `src/stories/components/` mirror `packages/components/src/components/` folder names (`editors`, `Toast`, …); sidebar titles use `components/<folder>/…`; `@webui/*` Vite aliases import package source without a build.

### Removed

- Unused `VaultStyleListSection`, `VaultStyleDataTable`, and `VaultStyleListFooter` (`components/list/`) — not consumed by vault or certs-ui; list screens use `DataTable` instead.

### Fixed

- Editor `colspan` uses static Tailwind `col-span-*` classes via `functions/tailwind/gridColSpan.ts` so Storybook and Vite builds apply the 12-column grid correctly.
- Storybook 10 preview: Vite `esbuild` JSX set to `automatic` so decorators and stories no longer throw `React is not defined`.

## [0.2.0] - 2026-05-24

### Added

- Jest test suite (50 tests) covering `@maks-it.com/webui-core` utilities and `@maks-it.com/webui-contracts` schemas.
- Root `npm test` script and per-package build tsconfigs (`tsconfig.build.json`) for TypeScript 6 declaration emit.

### Changed

- Updated dependencies to current majors: TypeScript 6, Jest 30, Zod 4.4, lucide-react 1.x, axios 1.16, and React 19.2.
- Migrated Zod schemas to v4 APIs: `intersection()` replaces `.and()`, custom refinements use `'custom'` issue codes.
- `@maks-it.com/webui-components` Toast IDs now use `crypto.randomUUID()`; lodash imports use `lodash/debounce` subpaths.
- Peer dependency ranges: `zod` ^4.4, `axios` ^1.16, `lucide-react` ^1.0.

### Removed

- `uuid` runtime dependency from `@maks-it.com/webui-components`.

## [0.1.0] - 2026-05-24

### Added

- Initial `@maks-it.com/webui-contracts`, `@maks-it.com/webui-core`, and `@maks-it.com/webui-components` packages extracted from Certs UI and Vault WebUI.
- npm publish under the `@maks-it.com` org scope on registry.npmjs.org.
