# Release-Package

Plugin-driven release engine. Run `Release-Package.ps1` from this directory (or `Release-Package.bat`). Configuration: `scriptsettings.json` (see `_comments` for plugin keys).

Canonical source: this folder in **maksit-repoutils**. Product repositories refresh via `Update-RepoUtils` or by copying from here.

## Modules (orchestration)

| File | Role |
|------|------|
| `Release-Package.ps1` | Loads settings, builds `New-EngineContext`, runs plugins in order. |
| `PluginSupport.psm1` | Plugin discovery, `Invoke-ConfiguredPlugin`; publish plugins honor `skipPublishPlugins` from `ReleasePublishGuard` (no per-plugin `branches` for GitHub/NuGet/Docker/Helm). |
| `ReleaseContext.psm1` | Resolves semver via `Resolve-ReleaseVersion` from `DotNetReleaseVersion.projectFiles` (first `.csproj` `<Version>`) or `NpmReleaseVersion.packageJsonPath`. |
| `EngineSupport.psm1` | Warn-only dirty-tree preflight; default `context.tag` = `v{version}` from the configured version plugin; `Initialize-ReleaseStageContext` sets `releaseDir` only. |

Shared module `../ChangelogSupport.psm1` (repo `src/`) parses release notes for the GitHub plugin: only `## [semver] - YYYY-MM-DD` version lines (Keep a Changelog). The latest header must match `context.version` from the version plugin.

## Plugins

`CorePlugins/` — e.g. `DotNetReleaseVersion`, `NpmReleaseVersion`, `NpmBuild`, `NpmPublish`, `DockerPush`, `HelmPush`, `ReleasePublishGuard`. Optional `CustomPlugins/`.

`DotNetPack` and `QualityGate` (when used) can declare their own `projectFiles`; semver still comes from the configured version plugin (`DotNetReleaseVersion` or `NpmReleaseVersion`).

## `ReleasePublishGuard`

Configure this plugin **immediately before** `DockerPush`, `HelmPush`, `GitHub`, `DotNetNuGet`, and `NpmPublish`. It sets shared `skipPublishPlugins` when branch/tag rules fail (`whenRequirementsNotMet`: `skip` or `fail`). Those publish plugins no longer use their own `branches` key — list allowed branches on the guard only. Preflight does not read git tags; the guard sets `context.tag` from `HEAD` when `requireExactTagOnHead` is true. **`context.version` stays from the version plugin** (`DotNetReleaseVersion` or `NpmReleaseVersion`; the guard does not override it). Use `tagVersionMustMatchReleaseVersion` (or legacy `tagVersionMustMatchDotNetRelease` / `tagVersionMustMatchNpmRelease`) to require the git tag semver to match `context.version`.

## npm workspaces

For TypeScript monorepos published to npmjs:

1. `NpmReleaseVersion` — reads `packageJsonPath` (workspace root `package.json`), optional `syncWorkspaceVersions: true` to align `packages/*/package.json` versions.
2. `NpmBuild` — `npm ci` + `npm run build` in `workspaceRoot` (defaults to shared `npmWorkspaceRoot` from step 1).
3. `ReleasePublishGuard` — same tag/branch rules; set `tagVersionMustMatchReleaseVersion: true`.
4. `NpmPublish` — `publishOrder` workspace package names, `npmApiKey` env var name (e.g. `NPMJS_MAKS_IT`), optional `registry` / `access`.

## `DotNetTest` and shared context

`DotNetTest` runs once and writes aggregated coverage and test metrics on the shared engine context (`qualityLineCoverage`, `coverageLineRate`, `testResult`, …). `QualityGate` reads those values for optional line-coverage thresholds; it does not re-run tests. Set `scanVulnerabilities` to false to skip `dotnet list package --vulnerable`.

## Helm charts in git

Commit `Chart.yaml` with placeholder `version` and `appVersion` (for example `0.0.0`) so `helm lint` stays valid. `HelmPush` temporarily replaces both with the **bare** release semver from `context.version` (`DotNetReleaseVersion`, e.g. `3.3.4` without a `v` prefix) before packaging and OCI push; if `version` were missing, it would fall back to stripping `v`/`V` from `context.tag`. Then it restores `Chart.yaml`. `DockerPush` tags images with the **bare** semver from `context.version` (e.g. `3.3.4`), also pushes `vX.Y.Z` and `shared.tag` when they differ, and optional `latest` — not from `Chart.yaml`; optionally use per-image `versionEnvFiles` to temporarily set `VITE_APP_VERSION={shared.version}` in frontend `.env` files during docker build, then restore originals. Each image may override the plugin `contextPath` with its own `contextPath` (paths relative to Release-Package); `dockerfile` and `versionEnvFiles` resolve against that per-image context.

Sample chart: repository `charts/my-service/` (matches the sample `chartPath` in `scriptsettings.json`). Product repos often use `src/helm/` instead.

