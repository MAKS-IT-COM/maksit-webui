# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.2.0] - 2026-05-24

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

## [v0.1.0] - 2026-05-24

### Added

- Initial `@maks-it.com/webui-contracts`, `@maks-it.com/webui-core`, and `@maks-it.com/webui-components` packages extracted from Certs UI and Vault WebUI.
- npm publish under the `@maks-it.com` org scope on registry.npmjs.org.
