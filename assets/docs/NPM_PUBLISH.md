# Publishing `@maks-it.com/webui` to npm

The library is published under the **`@maks-it.com` scope** to [registry.npmjs.org](https://registry.npmjs.org), managed from the [maks-it.com npm org](https://www.npmjs.com/settings/maks-it.com/packages).

Published package:

| Package | npm |
|---------|-----|
| `@maks-it.com/webui` | https://www.npmjs.com/package/@maks-it.com/webui |

> **Note:** `@maks-it.com/webui-contracts`, `@maks-it.com/webui-core`, and `@maks-it.com/webui-components` were merged into `@maks-it.com/webui` starting at **0.4.0**. Migrate host apps to the single package.

## One-time npm setup

1. Sign in at https://www.npmjs.com/ with the **maks-it.com** org account.
2. Confirm the **`@maks-it.com` scope** exists under [Packages](https://www.npmjs.com/settings/maks-it.com/packages).
3. Create an **Automation** token (recommended) or Granular Access token with **Publish** on `@maks-it.com/*`:
   - https://www.npmjs.com/settings/maks-it.com/tokens
4. Store the token for release tooling:
   - **CI / release engine:** set **`RepoUtilsSecretsShared`** and **`RepoUtilsSecrets`** to JSON objects. The **`Npm`** slot is the automation token; **`GitClone`** is the GitHub token. The repo pack overrides the shared pack.
   - **Local one-off publish:** `npm login` or a user-level `~/.npmrc` entry:
     ```
     //registry.npmjs.org/:_authToken=YOUR_TOKEN
     ```

Scoped packages must use **`--access public`** (already configured in package `publishConfig`).

## Manual publish

From the repo root:

```powershell
cd src
npm ci
npm run build
npm publish -w @maks-it.com/webui --access public
```

Verify:

```powershell
npm view @maks-it.com/webui version
```

## Release pipeline (recommended)

Use **`utils\Invoke-ReleasePackage-Single.bat`** (or `pwsh utils\engines\release\Invoke-ReleasePackage.ps1`):

1. Bump version in `src/package.json` (or tag drives `NpmReleaseVersion`).
2. Tag `HEAD` with exact semver, e.g. `git tag v0.4.0 && git push origin v0.4.0`.
3. Set `$env:RepoUtilsSecretsShared` and `$env:RepoUtilsSecrets` (JSON packs with `Npm` and `GitClone`) and run the release engine. `NpmPublish` runs `npm stage publish` (npm CLI 11.15+). Approve the staged version with 2FA: `npm stage list @maks-it.com/webui`, then `npm stage approve <stage-id>`.

`utils\engines\release\scriptSettings.json` runs `NpmReleaseVersion`, `NpmBuild`, `ReleasePublishGuard`, optional `GitHub`, then `NpmPublish`.

## After publish — Certs UI / Vault

In each WebUI app (`MaksIT.WebUI/package.json`):

```json
"@maks-it.com/webui": "^0.4.0"
```

Then refresh the lockfile:

```bash
cd src/MaksIT.WebUI
npm install
```

Docker builds use `npm ci` from the lockfile; no sibling `maksit-webui` clone is required in the image context.
