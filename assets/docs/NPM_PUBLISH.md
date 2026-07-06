# Publishing `@maks-it.com/webui-*` to npm

Packages are published under the **`@maks-it.com` scope** to [registry.npmjs.org](https://registry.npmjs.org), managed from the [maks-it.com npm org](https://www.npmjs.com/settings/maks-it.com/packages).

Published packages:

| Package | npm |
|---------|-----|
| `@maks-it.com/webui-contracts` | https://www.npmjs.com/package/@maks-it.com/webui-contracts |
| `@maks-it.com/webui-core` | https://www.npmjs.com/package/@maks-it.com/webui-core |
| `@maks-it.com/webui-components` | https://www.npmjs.com/package/@maks-it.com/webui-components |

## One-time npm setup

1. Sign in at https://www.npmjs.com/ with the **maks-it.com** org account.
2. Confirm the **`@maks-it.com` scope** exists under [Packages](https://www.npmjs.com/settings/maks-it.com/packages). The org name `maks-it.com` is the npm scope for scoped packages.
3. Create an **Automation** token (recommended) or Granular Access token with **Publish** on `@maks-it.com/*`:
   - https://www.npmjs.com/settings/maks-it.com/tokens
4. Store the token for release tooling:
   - **CI / release engine:** set environment variable **`Npm`** (logical secret name in `scriptSettings.json`).
   - **Local one-off publish:** `npm login` or a user-level `~/.npmrc` entry:
     ```
     //registry.npmjs.org/:_authToken=YOUR_TOKEN
     ```

Scoped packages must use **`--access public`** (already configured in each package `publishConfig`).

## Manual first publish (0.1.0)

From the repo root:

```powershell
cd src
npm ci
npm run build
npm publish -w @maks-it.com/webui-contracts --access public
npm publish -w @maks-it.com/webui-core --access public
npm publish -w @maks-it.com/webui-components --access public
```

Order matters: **contracts → core → components**.

Verify:

```powershell
npm view @maks-it.com/webui-contracts version
npm view @maks-it.com/webui-core version
npm view @maks-it.com/webui-components version
```

## Release pipeline (recommended)

Use **`utils\Invoke-ReleasePackage-Single.bat`** (or `pwsh utils\engines\release\Invoke-ReleasePackage.ps1`):

1. Bump version in `src/package.json` (or tag drives `NpmReleaseVersion`).
2. Tag `HEAD` with exact semver, e.g. `git tag v0.2.0 && git push origin v0.2.0`.
3. Set `$env:Npm` and run the release engine.

`utils\engines\release\scriptSettings.json` runs `NpmReleaseVersion`, `NpmBuild`, `ReleasePublishGuard`, optional `GitHub`, then `NpmPublish` in dependency order.

## After publish — Certs UI / Vault

In each WebUI app (`MaksIT.WebUI/package.json`):

```json
"@maks-it.com/webui-contracts": "^0.1.0",
"@maks-it.com/webui-core": "^0.1.0",
"@maks-it.com/webui-components": "^0.1.0"
```

Then refresh the lockfile:

```bash
cd src/MaksIT.WebUI
npm install
```

Docker builds use `npm ci` from the lockfile; no sibling `maksit-webui` clone is required in the image context.
