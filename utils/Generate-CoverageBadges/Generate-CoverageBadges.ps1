#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Legacy entry point — forwards to the Run-Tests plugin engine.

.DESCRIPTION
    Generate-CoverageBadges.ps1 is kept for backward compatibility.
    Configure plugins in src/Run-Tests/scriptsettings.json.
#>

$ErrorActionPreference = "Stop"

$runTestsScript = Join-Path (Split-Path $PSScriptRoot -Parent) "Run-Tests\Run-Tests.ps1"
if (-not (Test-Path $runTestsScript -PathType Leaf)) {
    Write-Error "Run-Tests engine not found at: $runTestsScript"
    exit 1
}

& pwsh -NoProfile -ExecutionPolicy Bypass -File $runTestsScript
exit $LASTEXITCODE
