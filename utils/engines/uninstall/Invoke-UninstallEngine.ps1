#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Plugin-driven Helm uninstall engine entry script.

.PARAMETER Mode
    Optional override when inheriting HelmSelfDeploy settings (single or ha).
    When omitted, HelmSelfDeploy.deployMode from engines/release/scriptSettings.json is used.
#>

[CmdletBinding()]
param(
    [ValidateSet('single', 'ha')]
    [string]$Mode
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$srcDir = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

. (Join-Path $srcDir 'modules/Engine/Import-EngineModules.ps1')
Import-EngineModules -Engine Test

$settings = Get-ScriptSettings -ScriptDir $PSScriptRoot
$releaseSettings = Get-ScriptSettings -ScriptDir (Join-Path $PSScriptRoot '..\release')
$resolveModeParams = @{ Settings = $releaseSettings }
if ($PSBoundParameters.ContainsKey('Mode')) {
    $resolveModeParams['ModeOverride'] = $Mode
}
$deployMode = Get-DeployModeFromSettings @resolveModeParams
$configuredPlugins = Get-ConfiguredPlugins -Settings $settings

Write-Log -Level 'STEP' -Message '=================================================='
Write-Log -Level 'STEP' -Message "HELM UNINSTALL ENGINE (deploy mode: $deployMode)"
Write-Log -Level 'STEP' -Message '=================================================='

$engineContext = New-EngineContext -ScriptDir $PSScriptRoot -SrcDir $srcDir -Settings $settings -DeployMode $deployMode

if ($configuredPlugins.Count -eq 0) {
    Write-Log -Level 'WARN' -Message 'No plugins configured in scriptSettings.json.'
    exit 0
}

$uninstallHadPluginFailures = $false

foreach ($plugin in $configuredPlugins) {
    $pluginSucceeded = Invoke-ConfiguredPlugin -Plugin $plugin -SharedSettings $engineContext -EngineDirectory $PSScriptRoot -ContinueOnError:$false
    if (-not $pluginSucceeded) {
        $uninstallHadPluginFailures = $true
        break
    }
}

Write-Log -Level 'OK' -Message '=================================================='
if ($uninstallHadPluginFailures) {
    Write-Log -Level 'ERROR' -Message 'UNINSTALL FAILED'
}
else {
    Write-Log -Level 'OK' -Message 'UNINSTALL COMPLETE'
}
Write-Log -Level 'OK' -Message '=================================================='

if ($uninstallHadPluginFailures) {
    exit 1
}
