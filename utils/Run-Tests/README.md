# Run Tests

Plugin-driven test engine (same pattern as `src/Release-Package`).

## Run

```powershell
pwsh -File .\src\Run-Tests\Run-Tests.ps1
```

Or:

```bat
src\Run-Tests\Run-Tests.bat
```

## Core plugins

| Plugin | Role |
|--------|------|
| `DotNetTest` | `dotnet test` + Coverlet Cobertura (`.NET` repos) |
| `NpmJestTest` | `npm test -- --coverage` + Jest `coverage-summary.json` |
| `QualityGate` | Optional line-coverage threshold from shared context |
| `CoverageBadges` | SVG badges for README (`assets/badges/`) |

Configure plugin order and settings in `scriptsettings.json`.

## Shared context

Test plugins publish metrics for downstream plugins:

- `qualityLineCoverage`, `coverageLineRate`, `coverageBranchRate`, `coverageMethodRate`
- `testResult` (full result object from `TestRunner`)

`QualityGate` and `CoverageBadges` read these keys; they do not re-run tests.

## npm/Jest example

Replace `DotNetTest` with:

```json
{
  "name": "NpmJestTest",
  "stageLabel": "test",
  "enabled": true,
  "workspaceRoot": "..\\..\\src",
  "testScript": "test",
  "coverageDirectory": "coverage"
}
```

## Legacy entry point

`src/Generate-CoverageBadges/Generate-CoverageBadges.ps1` forwards to this engine.

## Custom plugins

Add `CustomPlugins/YourPlugin.psm1` with `Invoke-Plugin`, then register it in `scriptsettings.json`.
