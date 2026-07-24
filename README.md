# MaksIT.WebUI

![Line Coverage](https://img.shields.io/badge/Line%20Coverage-83.8%25-brightgreen)
![Branch Coverage](https://img.shields.io/badge/Branch%20Coverage-72.5%25-green)
![Method Coverage](https://img.shields.io/badge/Method%20Coverage-72.8%25-green)

Shared React UI library for **maksit-certs-ui** and **maksit-vault** WebUI apps.

## Package

| npm package | Description |
|-------------|-------------|
| `@maks-it.com/webui` | Contracts, utilities (`deepDelta`, hooks, HTTP, SignalR), and React components |

Source lives under `src/` (`@maks-it.com/webui` — `contracts/`, `core/`, `components/`). Release automation lives under `utils/`.

## Local development

```bash
cd src
npm install
npm run build
npm test
npm run storybook
```

**Storybook** (`npm run storybook`) runs a local component catalog with Tailwind, React Router, autodocs, a11y checks, and **Vitest component tests** (testing widget + `npm run test-storybook`). Stories live under `src/stories/components/`; see `src/stories/README.md`.

Tests and coverage badges (shields.io URLs in this README): **`utils\Invoke-TestEngine.bat`** (plugin config in `utils\engines\test\scriptSettings.json`; uses `NpmJestTest` + `CoverageBadges` with `badgeFormat: shields`).

## Release to npmjs

1. Set **`Npm`** environment variable to your npm automation token (logical secret name in `scriptSettings.json`).
2. Bump **`src/package.json`** `version` (and tag `vX.Y.Z` on `main` when using the publish guard).
3. Run **`utils\Invoke-ReleasePackage-Single.bat`** (or `pwsh utils\engines\release\Invoke-ReleasePackage.ps1`).

Configured plugins (see `utils\engines\release\scriptSettings.json`):

| Plugin | Role |
|--------|------|
| `NpmReleaseVersion` | Read semver from `src/package.json` |
| `NpmBuild` | `npm ci` + `npm run build` |
| `ReleasePublishGuard` | Branch/tag checks before publish |
| `GitHub` | GitHub release (optional; set `GitHub` env var) |
| `NpmPublish` | Publish `@maks-it.com/webui` |

Refresh shared utils from repoutils: **`utils\Update-RepoUtils.bat`**.

## Consume in product repos

```bash
npm install @maks-it.com/webui
```

See [assets/docs/NPM_CONSUMPTION.md](assets/docs/NPM_CONSUMPTION.md).

## License

MIT
