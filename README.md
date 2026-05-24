# MaksIT.WebUI

![Line Coverage](/assets/badges/coverage-lines.svg) ![Branch Coverage](/assets/badges/coverage-branches.svg) ![Method Coverage](/assets/badges/coverage-methods.svg)

Shared React UI library for **maksit-certs-ui** and **maksit-vault** WebUI apps.

## Packages

| npm package | Description |
|-------------|-------------|
| `@maks-it.com/webui-contracts` | Shared TypeScript contracts (paging, gallery types, patch ops, scopes) |
| `@maks-it.com/webui-core` | Utilities (`deepDelta`, enum helpers, ACL parsers) and `useFormState` |
| `@maks-it.com/webui-components` | React components, layout, editors, DataTable, auth shell |

Source lives under `src/` (npm workspaces). Release automation lives under `utils/` (from [maksit-repoutils](https://github.com/MAKS-IT-COM/maksit-repoutils)).

## Local development

```bash
cd src
npm install
npm run build
npm test
```

Tests and coverage badges: **`utils/Run-Tests/Run-Tests.bat`** (plugin config in `utils/Run-Tests/scriptsettings.json`; uses `NpmJestTest`).

## Release to npmjs

1. Set **`NPMJS_MAKS_IT`** to your npm automation token (same pattern as `NUGET_MAKS_IT` for NuGet).
2. Bump **`src/package.json`** `version` (and tag `vX.Y.Z` on `main` when using the publish guard).
3. Run **`utils/Release-Package/Release-Package.bat`** (or `pwsh utils/Release-Package/Release-Package.ps1`).

Configured plugins (see `utils/Release-Package/scriptsettings.json`):

| Plugin | Role |
|--------|------|
| `NpmReleaseVersion` | Read semver from `src/package.json`; sync `packages/*/package.json` |
| `NpmBuild` | `npm ci` + `npm run build` |
| `ReleasePublishGuard` | Branch/tag checks before publish |
| `GitHub` | GitHub release (optional; needs `GITHUB_MAKS_IT_COM`) |
| `NpmPublish` | Publish workspace packages in dependency order |

Refresh shared utils from repoutils: **`utils/Update-RepoUtils/Update-RepoUtils.bat`**.

## Consume in product repos

```bash
npm install @maks-it.com/webui-contracts @maks-it.com/webui-core @maks-it.com/webui-components
```

Wrap the app with `WebUiProvider` and pass axios/redux adapters — see [assets/docs/NPM_CONSUMPTION.md](assets/docs/NPM_CONSUMPTION.md).

## License

MIT
