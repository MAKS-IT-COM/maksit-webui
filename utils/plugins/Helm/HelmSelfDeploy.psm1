#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Helm self-deploy plugin — upgrade/install the release chart on the target cluster after HelmPush.

.DESCRIPTION
    Deployment settings (namespace, postgresWait, charts) are configured on the HelmSelfDeploy plugin
    entry in scriptSettings.json. Chart version comes from shared.version (DotNetReleaseVersion).
    Existing releases with valuesFile use -f on every upgrade. Without valuesFile, upgrades use --reuse-values. helmSet supports {chartVersion} for --set overrides (e.g. image tags).
#>

if (-not (Get-Command Import-PluginDependency -ErrorAction SilentlyContinue)) {
    $srcDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
    $pluginSupportModulePath = Join-Path $srcDir "modules/Engine/PluginSupport.psm1"
    if (Test-Path $pluginSupportModulePath -PathType Leaf) {
        Import-Module $pluginSupportModulePath -Force -Global -ErrorAction Stop
    }
}

function Invoke-Plugin {
    param(
        [Parameter(Mandatory = $true)]
        $Settings
    )

    Import-PluginDependency -ModuleName "Logging" -RequiredCommand "Write-Log"
    Import-PluginDependency -ModuleName "HelmDeploySupport" -RequiredCommand "Invoke-HelmRemoteChartUpgrade"

    $pluginSettings = $Settings
    $shared = $Settings.context
    $scriptDir = [string]$shared.ScriptDir

    $dryRun = Test-PluginSkipsRemoteMutation -Plugin $pluginSettings -SharedSettings $shared

    if (-not $pluginSettings.namespace) {
        throw "HelmSelfDeploy plugin requires 'namespace'."
    }

    if (-not $pluginSettings.charts -or @($pluginSettings.charts).Count -eq 0) {
        throw "HelmSelfDeploy plugin requires at least one chart in 'charts'."
    }

    $containerRegistrySecret = Resolve-PluginSecretName -PluginSettings $pluginSettings -PropertyName 'containerRegistrySecret'
    if (-not $dryRun -and [string]::IsNullOrWhiteSpace($containerRegistrySecret)) {
        throw "HelmSelfDeploy plugin requires 'containerRegistrySecret' (logical secret name, e.g. ContainerRegistry)."
    }

    $chartVersion = $null
    if ($shared.PSObject.Properties.Name -contains 'version' -and -not [string]::IsNullOrWhiteSpace([string]$shared.version)) {
        $chartVersion = ([string]$shared.version).Trim() -replace '^[vV]', ''
    }

    if ([string]::IsNullOrWhiteSpace($chartVersion) -and $shared.PSObject.Properties.Name -contains 'tag') {
        $chartVersion = ([string]$shared.tag).Trim() -replace '^[vV]', ''
    }

    if ([string]::IsNullOrWhiteSpace($chartVersion)) {
        throw "HelmSelfDeploy could not derive chart version from shared.version or shared.tag."
    }

    Confirm-HelmAndKubectlAvailable

    if ($dryRun) {
        Write-Log -Level "INFO" -Message "HelmSelfDeploy dry run: validating helm upgrade/install for namespace '$($pluginSettings.namespace)'."
    }

    $namespace = [string]$pluginSettings.namespace
    if (-not $dryRun) {
        Set-K8sNamespace -Namespace $namespace
    }

    $deployMode = 'ha'
    if ($shared.PSObject.Properties.Name -contains 'deployMode' -and -not [string]::IsNullOrWhiteSpace([string]$shared.deployMode)) {
        $deployMode = [string]$shared.deployMode
    }

    Write-Log -Level 'INFO' -Message "HelmSelfDeploy deploy mode: $deployMode (values.{mode}.yaml when present)."

    $skipPostgresWait = $false
    if ($pluginSettings.PSObject.Properties.Name -contains 'skipPostgresWait') {
        $skipPostgresWait = [bool]$pluginSettings.skipPostgresWait
    }

    if (-not $dryRun -and -not $skipPostgresWait -and $pluginSettings.PSObject.Properties.Name -contains 'postgresWait') {
        Invoke-PostgresClusterWait -PostgresWait $pluginSettings.postgresWait
    }

    foreach ($chart in @($pluginSettings.charts)) {
        if ($chart.source -and [string]$chart.source -ne "remote") {
            Write-Log -Level "INFO" -Message "Skipping non-remote chart entry (source=$($chart.source))."
            continue
        }

        $stepMessage = if ($dryRun) {
            "Dry run: validating Helm release '$($chart.releaseName)' version $chartVersion ..."
        }
        else {
            "Self-deploying Helm release '$($chart.releaseName)' version $chartVersion ..."
        }

        Write-Log -Level "STEP" -Message $stepMessage
        Invoke-HelmRemoteChartUpgrade `
            -Namespace $namespace `
            -Chart $chart `
            -ChartVersion $chartVersion `
            -DeploySettingsDir $scriptDir `
            -DefaultHelmCredentialsSecret $containerRegistrySecret `
            -SharedSettings $shared `
            -DryRun:$dryRun
    }

    if ($dryRun) {
        Write-Log -Level "INFO" -Message "HelmSelfDeploy dry run completed for namespace '$namespace'."
        return
    }

    $waitForPods = $true
    if ($pluginSettings.PSObject.Properties.Name -contains 'waitForPodsReady') {
        $waitForPods = [bool]$pluginSettings.waitForPodsReady
    }

    if ($waitForPods) {
        $timeout = 600
        if ($pluginSettings.PSObject.Properties.Name -contains 'podsReadyTimeoutSeconds' -and $null -ne $pluginSettings.podsReadyTimeoutSeconds) {
            $timeout = [int]$pluginSettings.podsReadyTimeoutSeconds
        }

        if (-not (Wait-NamespacePodsReady -Namespace $namespace -TimeoutSeconds $timeout)) {
            throw "Not all pods became ready in namespace '$namespace' within ${timeout}s."
        }
    }

    $bgpServices = @()
    if ($pluginSettings.PSObject.Properties.Name -contains 'bgpServices' -and $pluginSettings.bgpServices) {
        $bgpServices = @($pluginSettings.bgpServices)
    }

    if ($bgpServices.Count -gt 0) {
        Import-PluginDependency -ModuleName "HelmDeploySupport" -RequiredCommand "Set-BgpServices"
        $releaseName = [string]$pluginSettings.charts[0].releaseName
        $bgpDefaultPort = 80
        if ($pluginSettings.PSObject.Properties.Name -contains 'bgpDefaultPort' -and $null -ne $pluginSettings.bgpDefaultPort) {
            $bgpDefaultPort = [int]$pluginSettings.bgpDefaultPort
        }

        Write-Log -Level "STEP" -Message "Applying $($bgpServices.Count) BGP service(s) for release '$releaseName' ..."
        Set-BgpServices -Namespace $namespace -ScriptDir $scriptDir -ReleaseName $releaseName -BgpServices $bgpServices -DefaultPort $bgpDefaultPort

        $testBgp = $false
        if ($pluginSettings.PSObject.Properties.Name -contains 'testBgpConnectivity') {
            $testBgp = [bool]$pluginSettings.testBgpConnectivity
        }

        if ($testBgp) {
            Import-PluginDependency -ModuleName "HelmDeploySupport" -RequiredCommand "Test-BgpConnectivity"
            $bgpTimeout = 300
            if ($pluginSettings.PSObject.Properties.Name -contains 'bgpConnectivityTimeoutSeconds' -and $null -ne $pluginSettings.bgpConnectivityTimeoutSeconds) {
                $bgpTimeout = [int]$pluginSettings.bgpConnectivityTimeoutSeconds
            }

            Test-BgpConnectivity -BgpServices $bgpServices -TimeoutSeconds $bgpTimeout
        }
    }

    Write-Log -Level "INFO" -Message "HelmSelfDeploy completed for namespace '$namespace'."
}

function Get-PluginMetadata {
    [pscustomobject]@{ mutatesRemote = $true }
}

Export-ModuleMember -Function Invoke-Plugin, Get-PluginMetadata
