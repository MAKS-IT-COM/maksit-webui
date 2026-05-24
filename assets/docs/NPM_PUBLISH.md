# Publishing `@maksit/webui-*` to npm

Packages are published under the **`@maksit` scope** to [registry.npmjs.org](https://registry.npmjs.org), managed from the [maks-it.com npm org](https://www.npmjs.com/settings/maks-it.com/packages).

Published packages:

| Package | npm |
|---------|-----|
| `@maksit/webui-contracts` | https://www.npmjs.com/package/@maksit/webui-contracts |
| `@maksit/webui-core` | https://www.npmjs.com/package/@maksit/webui-core |
| `@maksit/webui-components` | https://www.npmjs.com/package/@maksit/webui-components |

## One-time npm setup

1. Sign in at https://www.npmjs.com/ with the **maks-it.com** org account.
2. Confirm the **`@maksit` scope** exists under [Packages](https://www.npmjs.com/settings/maks-it.com/packages). Create the org/scope on npm if this is the first `@maksit/*` publish.
3. Create an **Automation** token (recommended) or Granular Access token with **Publish** on `@maksit/*`:
   - https://www.npmjs.com/settings/maks-it.com/tokens
4. Store the token for release tooling:
   - **CI / Release-Package:** set env var `NPMJS_MAKS_IT` to the token value (same pattern as `NUGET_MAKS_IT`).
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
npm publish -w @maksit/webui-contracts --access public
npm publish -w @maksit/webui-core --access public
npm publish -w @maksit/webui-components --access public
```

Order matters: **contracts → core → components**.

Or use the helper script:

```powershell
.\scripts\publish-npm.ps1
```

Verify:

```powershell
npm view @maksit/webui-contracts version
npm view @maksit/webui-core version
npm view @maksit/webui-components version
```

## Release pipeline (recommended)

From `utils/Release-Package/`:

1. Bump version in `src/package.json` (or tag drives `NpmReleaseVersion`).
2. Tag `HEAD` with exact semver, e.g. `git tag v0.1.0 && git push origin v0.1.0`.
3. Set `NPMJS_MAKS_IT` and run `Release-Package.ps1`.

`scriptsettings.json` runs `NpmBuild` then `NpmPublish` in dependency order.

## After publish — Certs UI / Vault

In each WebUI app (`MaksIT.WebUI/package.json`):

```json
"@maksit/webui-contracts": "^0.1.0",
"@maksit/webui-core": "^0.1.0",
"@maksit/webui-components": "^0.1.0"
```

Then refresh the lockfile:

```bash
cd src/MaksIT.WebUI
npm install
```

Docker builds use `npm ci` from the lockfile; no sibling `maksit-webui` clone is required in the image context.
