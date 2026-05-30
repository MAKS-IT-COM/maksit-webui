#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Plugin-driven test and coverage engine.

.DESCRIPTION
    Loads scriptsettings.json, builds shared execution context, and runs configured
    plugins in order. Each plugin implements Invoke-Plugin and receives its own
    settings plus shared context on Settings.context.

.USAGE
    pwsh -File .\Run-Tests.ps1
#>

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$utilsDir = Split-Path $scriptDir -Parent

$scriptConfigModulePath = Join-Path $utilsDir "ScriptConfig.psm1"
if (-not (Test-Path $scriptConfigModulePath)) {
    Write-Error "ScriptConfig module not found at: $scriptConfigModulePath"
    exit 1
}
Import-Module $scriptConfigModulePath -Force

$loggingModulePath = Join-Path $utilsDir "Logging.psm1"
if (-not (Test-Path $loggingModulePath)) {
    Write-Error "Logging module not found at: $loggingModulePath"
    exit 1
}
Import-Module $loggingModulePath -Force

$pluginSupportModulePath = Join-Path $scriptDir "PluginSupport.psm1"
if (-not (Test-Path $pluginSupportModulePath)) {
    Write-Error "PluginSupport module not found at: $pluginSupportModulePath"
    exit 1
}
Import-Module $pluginSupportModulePath -Force

$engineSupportModulePath = Join-Path $scriptDir "EngineSupport.psm1"
if (-not (Test-Path $engineSupportModulePath)) {
    Write-Error "EngineSupport module not found at: $engineSupportModulePath"
    exit 1
}
Import-Module $engineSupportModulePath -Force

$releaseContextModulePath = Join-Path $utilsDir "Release-Package\ReleaseContext.psm1"
if (-not (Test-Path $releaseContextModulePath)) {
    Write-Error "ReleaseContext module not found at: $releaseContextModulePath"
    exit 1
}
Import-Module $releaseContextModulePath -Force

$settings = Get-ScriptSettings -ScriptDir $scriptDir
$configuredPlugins = Get-ConfiguredPlugins -Settings $settings
$pluginsDir = Join-Path $scriptDir "CorePlugins"

Write-Log -Level "STEP" -Message "=================================================="
Write-Log -Level "STEP" -Message "TEST ENGINE"
Write-Log -Level "STEP" -Message "=================================================="

$engineContext = New-EngineContext -ScriptDir $scriptDir -UtilsDir $utilsDir -Settings $settings

if ($configuredPlugins.Count -eq 0) {
    Write-Log -Level "WARN" -Message "No plugins configured in scriptsettings.json."
    exit 0
}

$testHadPluginFailures = $false

foreach ($plugin in $configuredPlugins) {
    $pluginSucceeded = Invoke-ConfiguredPlugin -Plugin $plugin -SharedSettings $engineContext -PluginsDirectory $pluginsDir -ContinueOnError:$false
    if (-not $pluginSucceeded) {
        $testHadPluginFailures = $true
        break
    }
}

Write-Log -Level "OK" -Message "=================================================="
if ($testHadPluginFailures) {
    Write-Log -Level "ERROR" -Message "TEST RUN FAILED"
}
else {
    Write-Log -Level "OK" -Message "TEST RUN COMPLETE"
}
Write-Log -Level "OK" -Message "=================================================="

if ($testHadPluginFailures) {
    exit 1
}
