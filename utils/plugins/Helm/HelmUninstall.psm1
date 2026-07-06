#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Helm uninstall plugin — remove Helm release(s) and BGP LoadBalancer services from the target cluster.

.DESCRIPTION
    By default inherits namespace, charts, and bgpServices from the enabled HelmSelfDeploy entry in
    engines/release/scriptSettings.json (releaseSettingsFile, default ..\\release\\scriptSettings.json).
    Optional overrides on this plugin: deleteNamespace, releaseSettingsFile.
    kubectl/helm use KUBECONFIG, default kubeconfig, or in-cluster service account credentials.
#>

if (-not (Get-Command Import-PluginDependency -ErrorAction SilentlyContinue)) {
    $srcDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
    $pluginSupportModulePath = Join-Path $srcDir "modules/Engine/PluginSupport.psm1"
    if (Test-Path $pluginSupportModulePath -PathType Leaf) {
        Import-Module $pluginSupportModulePath -Force -Global -ErrorAction Stop
    }
}

function Resolve-HelmUninstallDeploySettings {
    param(
        [Parameter(Mandatory = $true)]
        $PluginSettings,

        [Parameter(Mandatory = $true)]
        [string]$EngineDir
    )

    $inherit = $true
    if ($PluginSettings.PSObject.Properties.Name -contains 'inheritFromRelease') {
        $inherit = [bool]$PluginSettings.inheritFromRelease
    }
    elseif ($PluginSettings.PSObject.Properties.Name -contains 'namespace' -and -not [string]::IsNullOrWhiteSpace([string]$PluginSettings.namespace)) {
        $inherit = $false
    }

    if (-not $inherit) {
        return $PluginSettings
    }

    $releaseSettingsFile = '..\release\scriptSettings.json'
    if ($PluginSettings.PSObject.Properties.Name -contains 'releaseSettingsFile' -and -not [string]::IsNullOrWhiteSpace([string]$PluginSettings.releaseSettingsFile)) {
        $releaseSettingsFile = [string]$PluginSettings.releaseSettingsFile
    }

    $releaseSettingsPath = [System.IO.Path]::GetFullPath((Join-Path $EngineDir $releaseSettingsFile))
    if (-not (Test-Path $releaseSettingsPath -PathType Leaf)) {
        throw "HelmUninstall could not find release settings at '$releaseSettingsPath' (releaseSettingsFile)."
    }

    $releaseSettings = Get-Content $releaseSettingsPath -Raw | ConvertFrom-Json
    $deployPlugin = $null
    if ($releaseSettings.PSObject.Properties.Name -contains 'plugins' -and $releaseSettings.plugins) {
        foreach ($candidate in @($releaseSettings.plugins)) {
            if ($candidate.name -eq 'HelmSelfDeploy' -and $candidate.enabled) {
                $deployPlugin = $candidate
                break
            }
        }
    }

    if ($null -eq $deployPlugin) {
        throw "HelmUninstall inheritFromRelease: no enabled HelmSelfDeploy plugin in '$releaseSettingsPath'."
    }

    $merged = @{}
    foreach ($property in $deployPlugin.PSObject.Properties) {
        $merged[$property.Name] = $property.Value
    }

    foreach ($property in $PluginSettings.PSObject.Properties) {
        if ($property.Name -in @('name', 'stageLabel', 'enabled', 'inheritFromRelease', 'releaseSettingsFile')) {
            continue
        }

        $merged[$property.Name] = $property.Value
    }

    if (-not $merged.ContainsKey('settingsDir') -or [string]::IsNullOrWhiteSpace([string]$merged['settingsDir'])) {
        $merged['settingsDir'] = '..\release'
    }

    return [pscustomobject]$merged
}

function Invoke-Plugin {
    param(
        [Parameter(Mandatory = $true)]
        $Settings
    )

    Import-PluginDependency -ModuleName "Logging" -RequiredCommand "Write-Log"
    Import-PluginDependency -ModuleName "HelmDeploySupport" -RequiredCommand "Invoke-HelmReleaseUninstall"

    $shared = $Settings.context
    $engineDir = [string]$shared.ScriptDir
    $pluginSettings = Resolve-HelmUninstallDeploySettings -PluginSettings $Settings -EngineDir $engineDir

    $dryRun = Test-PluginSkipsRemoteMutation -Plugin $pluginSettings -SharedSettings $shared
    if ($dryRun) {
        Write-Log -Level "INFO" -Message "Dry run: would uninstall Helm release(s) in namespace '$($pluginSettings.namespace)'."
        return
    }

    if (-not $pluginSettings.namespace) {
        throw "HelmUninstall requires 'namespace' (set explicitly or inherit from HelmSelfDeploy)."
    }

    if (-not $pluginSettings.charts -or @($pluginSettings.charts).Count -eq 0) {
        throw "HelmUninstall requires at least one chart in 'charts' (inherit from HelmSelfDeploy or set explicitly)."
    }

    $settingsDir = $engineDir
    if ($pluginSettings.PSObject.Properties.Name -contains 'settingsDir' -and -not [string]::IsNullOrWhiteSpace([string]$pluginSettings.settingsDir)) {
        $settingsDir = [System.IO.Path]::GetFullPath((Join-Path $engineDir ([string]$pluginSettings.settingsDir)))
    }

    Confirm-HelmAndKubectlAvailable
    $namespace = [string]$pluginSettings.namespace

    foreach ($chart in @($pluginSettings.charts)) {
        Write-Log -Level "STEP" -Message "Removing Helm release '$($chart.releaseName)' ..."
        Invoke-HelmReleaseUninstall -Namespace $namespace -Chart $chart
    }

    $bgpServices = @()
    if ($pluginSettings.PSObject.Properties.Name -contains 'bgpServices' -and $pluginSettings.bgpServices) {
        $bgpServices = @($pluginSettings.bgpServices)
    }

    if ($bgpServices.Count -gt 0) {
        Import-PluginDependency -ModuleName "HelmDeploySupport" -RequiredCommand "Remove-BgpServices"
        $releaseName = [string]$pluginSettings.charts[0].releaseName
        $bgpDefaultPort = 80
        if ($pluginSettings.PSObject.Properties.Name -contains 'bgpDefaultPort' -and $null -ne $pluginSettings.bgpDefaultPort) {
            $bgpDefaultPort = [int]$pluginSettings.bgpDefaultPort
        }

        Write-Log -Level "STEP" -Message "Removing $($bgpServices.Count) BGP service(s) for release '$releaseName' ..."
        Remove-BgpServices -Namespace $namespace -ScriptDir $settingsDir -ReleaseName $releaseName -BgpServices $bgpServices -DefaultPort $bgpDefaultPort
    }

    $deleteNamespace = $false
    if ($Settings.PSObject.Properties.Name -contains 'deleteNamespace') {
        $deleteNamespace = [bool]$Settings.deleteNamespace
    }

    if ($deleteNamespace) {
        Write-Log -Level "STEP" -Message "Deleting namespace '$namespace' ..."
        kubectl delete namespace $namespace --ignore-not-found 2>&1 | Out-Host
        if ($LASTEXITCODE -ne 0) {
            throw "kubectl delete namespace failed for '$namespace' (exit code $LASTEXITCODE)."
        }
    }

    Write-Log -Level "INFO" -Message "HelmUninstall completed for namespace '$namespace'."
}

function Get-PluginMetadata {
    [pscustomobject]@{ mutatesRemote = $true }
}

Export-ModuleMember -Function Invoke-Plugin, Get-PluginMetadata
