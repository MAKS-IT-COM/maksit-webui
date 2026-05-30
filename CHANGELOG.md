# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
