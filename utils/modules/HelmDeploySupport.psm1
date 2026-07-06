#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Shared helpers for HelmSelfDeploy (OCI chart upgrade/install against a live cluster).
#>

if (-not (Get-Command Get-RegistryCredentialsFromRuntime -ErrorAction SilentlyContinue)) {
    $srcDir = Split-Path $PSScriptRoot -Parent
    $pluginSupportModulePath = Join-Path $srcDir "Engine/PluginSupport.psm1"
    if (Test-Path $pluginSupportModulePath -PathType Leaf) {
        Import-Module $pluginSupportModulePath -Force -Global -ErrorAction Stop
    }
}

$scriptConfigModulePath = Join-Path (Split-Path $PSScriptRoot -Parent) 'ScriptConfig.psm1'
if (Test-Path -LiteralPath $scriptConfigModulePath -PathType Leaf) {
    Import-Module $scriptConfigModulePath -Force -Global -ErrorAction Stop
}

function Get-ContainerRegistryCredentialsFromSecret {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SecretName,

        [Parameter(Mandatory = $false)]
        [psobject]$SharedSettings
    )

    return Get-RegistryCredentialsFromRuntime -SecretName $SecretName -SharedSettings $SharedSettings
}

function Test-HelmAvailable {
    return [bool](Get-Command helm -ErrorAction SilentlyContinue)
}

function Test-KubectlAvailable {
    return [bool](Get-Command kubectl -ErrorAction SilentlyContinue)
}

function Confirm-HelmAndKubectlAvailable {
    if (-not (Test-HelmAvailable)) {
        throw "Helm is not installed or not in PATH."
    }

    if (-not (Test-KubectlAvailable)) {
        throw "kubectl is not installed or not in PATH."
    }
}

function Test-KubectlClusterReachable {
    kubectl cluster-info 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
}

function Get-HelmUpgradeDryRunArgs {
    if (Test-KubectlClusterReachable) {
        return @('--dry-run=server')
    }

    Write-Host "Cluster not reachable via kubectl; using client-side helm --dry-run."
    return @('--dry-run')
}

function Test-SecretEnvironmentValueAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if ([string]::IsNullOrWhiteSpace($Name)) {
        return $false
    }

    $value = [Environment]::GetEnvironmentVariable($Name)
    return -not [string]::IsNullOrWhiteSpace($value)
}

function Set-K8sNamespace {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace
    )

    $Namespace = $Namespace.Trim()
    if ([string]::IsNullOrWhiteSpace($Namespace)) {
        throw "Namespace name is missing or empty."
    }

    $ns = kubectl get namespace $Namespace --ignore-not-found -o name 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl get namespace failed for '$Namespace' (exit code $LASTEXITCODE)."
    }

    if (-not $ns) {
        Write-Host "Creating namespace $Namespace"
        kubectl create namespace $Namespace | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create namespace $Namespace"
        }
    }
}

function Wait-NamespacePodsReady {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace,
        [int]$TimeoutSeconds = 300,
        [int]$PollIntervalSeconds = 5
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        $json = kubectl get pods -n $Namespace -o json 2>$null
        if ($LASTEXITCODE -ne 0) {
            Start-Sleep -Seconds $PollIntervalSeconds
            continue
        }

        $obj = $json | ConvertFrom-Json
        $pods = @($obj.items)
        if ($pods.Count -eq 0) {
            Start-Sleep -Seconds $PollIntervalSeconds
            continue
        }

        $ready = 0
        foreach ($p in $pods) {
            $phase = if ($p.status) { $p.status.phase } else { "Unknown" }
            $conditions = if ($p.status.conditions) { @($p.status.conditions) } else { @() }
            $readyCond = $conditions | Where-Object { $_.type -eq "Ready" } | Select-Object -First 1
            if ($phase -eq "Running" -and $null -ne $readyCond -and $readyCond.status -eq "True") {
                $ready++
            }
        }

        if ($ready -eq $pods.Count) {
            Write-Host "All $($pods.Count) pod(s) in namespace $Namespace are ready."
            return $true
        }

        Write-Host "Pods in $Namespace : $ready / $($pods.Count) ready"
        Start-Sleep -Seconds $PollIntervalSeconds
    }

    Write-Warning "Timeout after ${TimeoutSeconds}s: not all pods in namespace $Namespace are ready."
    return $false
}

function Get-DerivedOciChartRefFromChartEntry {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Chart,
        [Parameter(Mandatory = $true)]
        [string]$ChartVersion
    )

    if ($Chart.PSObject.Properties.Name -notcontains "containerRegistry" -or -not $Chart.containerRegistry) {
        return $null
    }

    $cr = $Chart.containerRegistry
    $regHost = ""
    if ($cr.PSObject.Properties.Name -contains "registryUrl" -and -not [string]::IsNullOrWhiteSpace([string]$cr.registryUrl)) {
        $regHost = [string]$cr.registryUrl.Trim().TrimEnd('/')
        $regHost = $regHost -replace '^(https?|oci)://', ''
    }

    $ociChartsProject = if ($cr.PSObject.Properties.Name -contains "ociChartsProject" -and -not [string]::IsNullOrWhiteSpace([string]$cr.ociChartsProject)) {
        [string]$cr.ociChartsProject.Trim().Trim('/')
    }
    else {
        ""
    }

    $chartProject = if ($cr.PSObject.Properties.Name -contains "chartProject" -and -not [string]::IsNullOrWhiteSpace([string]$cr.chartProject)) {
        [string]$cr.chartProject.Trim().Trim('/')
    }
    else {
        ""
    }

    if ([string]::IsNullOrWhiteSpace($regHost) -or [string]::IsNullOrWhiteSpace($chartProject)) {
        return $null
    }

    $path = if ([string]::IsNullOrWhiteSpace($ociChartsProject)) { $chartProject } else { "$ociChartsProject/$chartProject" }
    return "oci://${regHost}/${path}:${ChartVersion}"
}

function Invoke-HelmOciChartRegistryLoginFromEnv {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RegistryHost,
        [Parameter(Mandatory = $true)]
        [string]$CredentialsSecret,
        [psobject]$SharedSettings = $null
    )

    $RegistryHost = $RegistryHost.Trim().TrimEnd('/')
    $helmCreds = Get-ContainerRegistryCredentialsFromSecret -SecretName $CredentialsSecret -SharedSettings $SharedSettings
    Write-Host "Logging Helm into OCI chart registry $RegistryHost"
    $prevEap = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        $helmCreds.Password | & helm registry login $RegistryHost --username $helmCreds.User --password-stdin 2>&1 | Out-Null
    }
    finally {
        $ErrorActionPreference = $prevEap
    }

    if ($LASTEXITCODE -ne 0) {
        throw "helm registry login failed for $RegistryHost (exit code $LASTEXITCODE)."
    }
}

function Set-KubernetesImagePullSecretFromEnv {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace,
        [Parameter(Mandatory = $true)]
        [string]$RegistryHost,
        [Parameter(Mandatory = $true)]
        [string]$SecretName,
        [Parameter(Mandatory = $true)]
        [string]$CredentialsSecret,
        [psobject]$SharedSettings = $null
    )

    $RegistryHost = $RegistryHost.Trim().TrimEnd('/')
    $creds = Get-ContainerRegistryCredentialsFromSecret -SecretName $CredentialsSecret -SharedSettings $SharedSettings
    Write-Host "Creating/updating image pull secret '$SecretName' in namespace $Namespace"
    $createArgs = @(
        "create", "secret", "docker-registry", $SecretName,
        "--docker-server=$RegistryHost",
        "--docker-username=$($creds.User)",
        "--docker-password", $creds.Password,
        "-n", $Namespace,
        "--dry-run=client", "-o", "yaml"
    )
    $secretYaml = & kubectl @createArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl create secret (dry-run) failed for '$SecretName': $secretYaml"
    }

    $secretYaml | kubectl apply -f -
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl apply failed for docker-registry secret '$SecretName' (exit code $LASTEXITCODE)."
    }
}

function Initialize-ContainerRegistryAuthForChart {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace,
        [Parameter(Mandatory = $true)]
        [object]$Chart,
        [string]$DefaultHelmCredentialsSecret = "",
        [psobject]$SharedSettings = $null,
        [switch]$DryRun
    )

    $reg = if ($Chart.PSObject.Properties.Name -contains "containerRegistry") { $Chart.containerRegistry } else { $null }
    if ($null -eq $reg) {
        return
    }

    $rel = if ($Chart.releaseName) { [string]$Chart.releaseName } else { "<unknown>" }
    $baseUrl = if ($reg.PSObject.Properties.Name -contains "registryUrl" -and -not [string]::IsNullOrWhiteSpace([string]$reg.registryUrl)) {
        [string]$reg.registryUrl.Trim().TrimEnd('/')
    }
    else {
        ""
    }

    $helmUrl = if ($reg.PSObject.Properties.Name -contains "helmRegistryUrl" -and -not [string]::IsNullOrWhiteSpace([string]$reg.helmRegistryUrl)) {
        [string]$reg.helmRegistryUrl.Trim().TrimEnd('/')
    }
    else {
        $baseUrl
    }

    $imgUrl = if ($reg.PSObject.Properties.Name -contains "imagesRegistryUrl" -and -not [string]::IsNullOrWhiteSpace([string]$reg.imagesRegistryUrl)) {
        [string]$reg.imagesRegistryUrl.Trim().TrimEnd('/')
    }
    else {
        $baseUrl
    }

    $helmCredsSecret = if ($reg.PSObject.Properties.Name -contains 'helmOciCredentialsSecret' -and -not [string]::IsNullOrWhiteSpace([string]$reg.helmOciCredentialsSecret)) {
        [string]$reg.helmOciCredentialsSecret
    }
    elseif (-not [string]::IsNullOrWhiteSpace($DefaultHelmCredentialsSecret)) {
        $DefaultHelmCredentialsSecret
    }
    else {
        ""
    }

    $imgCredsSecret = if ($reg.PSObject.Properties.Name -contains 'imagesCredentialsSecret' -and -not [string]::IsNullOrWhiteSpace([string]$reg.imagesCredentialsSecret)) {
        [string]$reg.imagesCredentialsSecret
    }
    else {
        ""
    }

    $imgSecretName = if ($reg.PSObject.Properties.Name -contains "imagePullSecretName" -and -not [string]::IsNullOrWhiteSpace([string]$reg.imagePullSecretName)) {
        [string]$reg.imagePullSecretName
    }
    else {
        "cr-maks-it"
    }

    if (-not [string]::IsNullOrWhiteSpace($helmCredsSecret)) {
        if ([string]::IsNullOrWhiteSpace($helmUrl)) {
            throw "Chart '$rel': containerRegistry.registryUrl is required for Helm OCI login."
        }

        if ($DryRun -and -not (Test-SecretEnvironmentValueAvailable -Name $helmCredsSecret)) {
            Write-Host "Dry run: skipping Helm OCI login; set env var '$helmCredsSecret' to validate remote OCI charts."
        }
        else {
            Invoke-HelmOciChartRegistryLoginFromEnv -RegistryHost $helmUrl -CredentialsSecret $helmCredsSecret -SharedSettings $SharedSettings
        }
    }

    if (-not $DryRun -and -not [string]::IsNullOrWhiteSpace($imgCredsSecret)) {
        if ([string]::IsNullOrWhiteSpace($imgUrl)) {
            throw "Chart '$rel': containerRegistry.registryUrl is required for image pull secret."
        }

        Set-KubernetesImagePullSecretFromEnv -Namespace $Namespace -RegistryHost $imgUrl -SecretName $imgSecretName -CredentialsSecret $imgCredsSecret -SharedSettings $SharedSettings
    }
}

function Test-HelmReleaseExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace,
        [Parameter(Mandatory = $true)]
        [string]$ReleaseName
    )

    $releaseExists = helm list -n $Namespace -q 2>$null | Select-String -Pattern "^${ReleaseName}$" -Quiet
    return [bool]$releaseExists
}

function Invoke-PostgresClusterWait {
    param(
        [Parameter(Mandatory = $true)]
        [object]$PostgresWait
    )

    if ($null -eq $PostgresWait -or $PostgresWait.enabled -ne $true) {
        return
    }

    $pgNs = if ($PostgresWait.namespace) { [string]$PostgresWait.namespace } else { "postgresql" }
    $cluster = if ($PostgresWait.clusterName) { [string]$PostgresWait.clusterName } else { "postgresql" }
    $timeout = if ($null -ne $PostgresWait.timeoutSeconds) { [int]$PostgresWait.timeoutSeconds } else { 600 }
    Write-Host "postgresWait: waiting for CNPG cluster '$cluster' in namespace '$pgNs' (timeout ${timeout}s)..."
    kubectl wait "cluster.postgresql.cnpg.io/$cluster" -n $pgNs --for=condition=Ready --timeout="${timeout}s"
    if ($LASTEXITCODE -ne 0) {
        throw "postgresWait failed: cluster '$cluster' in '$pgNs' did not become Ready."
    }

    Write-Host "postgresWait: cluster is Ready."
}

function Get-HelmSetArgsFromChartEntry {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Chart,
        [Parameter(Mandatory = $true)]
        [string]$ChartVersion
    )

    $setArg = @()
    if ($Chart.PSObject.Properties.Name -notcontains 'helmSet' -or -not $Chart.helmSet) {
        return $setArg
    }

    foreach ($prop in $Chart.helmSet.PSObject.Properties) {
        $val = ([string]$prop.Value) -replace '\{chartVersion\}', $ChartVersion
        $setArg += '--set'
        $setArg += "$($prop.Name)=$val"
    }

    return $setArg
}

function Invoke-HelmRemoteChartUpgrade {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace,
        [Parameter(Mandatory = $true)]
        [object]$Chart,
        [Parameter(Mandatory = $true)]
        [string]$ChartVersion,
        [Parameter(Mandatory = $true)]
        [string]$DeploySettingsDir,
        [string]$DefaultHelmCredentialsSecret = "",
        [psobject]$SharedSettings = $null,
        [switch]$DryRun
    )

    $releaseName = [string]$Chart.releaseName
    if ([string]::IsNullOrWhiteSpace($releaseName)) {
        throw "Chart entry is missing releaseName."
    }

    Initialize-ContainerRegistryAuthForChart -Namespace $Namespace -Chart $Chart -DefaultHelmCredentialsSecret $DefaultHelmCredentialsSecret -SharedSettings $SharedSettings -DryRun:$DryRun

    $ociRef = Get-DerivedOciChartRefFromChartEntry -Chart $Chart -ChartVersion $ChartVersion
    if ([string]::IsNullOrWhiteSpace($ociRef)) {
        throw "Could not derive OCI chart reference for release '$releaseName'. Set chart.containerRegistry.registryUrl and chartProject."
    }

    $valuesArg = @()
    $valuesPath = $null
    if ($Chart.PSObject.Properties.Name -contains 'valuesFile' -and -not [string]::IsNullOrWhiteSpace([string]$Chart.valuesFile)) {
        $deployMode = $null
        if ($null -ne $SharedSettings -and $SharedSettings.PSObject.Properties.Name -contains 'deployMode') {
            $deployMode = [string]$SharedSettings.deployMode
        }

        if ($deployMode -in @('single', 'ha')) {
            $valuesPath = Resolve-DeployValuesFilePath -DeploySettingsDir $DeploySettingsDir -ValuesFile ([string]$Chart.valuesFile) -DeployMode $deployMode
        }
        else {
            throw "HelmSelfDeploy requires deployMode 'single' or 'ha' when valuesFile is set."
        }

        $valuesArg = @('-f', $valuesPath)
    }

    $releaseExists = Test-HelmReleaseExists -Namespace $Namespace -ReleaseName $releaseName
    $reuseArg = @()
    if ($valuesArg.Count -gt 0) {
        if ($releaseExists) {
            Write-Host "Upgrading existing release '$releaseName' in namespace '$Namespace' with values file $valuesPath (chart version $ChartVersion)"
        }
        else {
            Write-Host "Installing new release '$releaseName' in namespace '$Namespace' with values file $valuesPath (chart version $ChartVersion)"
        }
    }
    elseif ($releaseExists) {
        Write-Host "Upgrading existing release '$releaseName' in namespace '$Namespace' to chart version $ChartVersion (reuse-values)"
        $reuseArg = @("--reuse-values")
    }
    else {
        throw "Release '$releaseName' is not installed in namespace '$Namespace'. Add values.single.yaml and values.ha.yaml beside scriptSettings.json and run utils/Invoke-ReleasePackage-HA.bat or Invoke-ReleasePackage-Single.bat for first install."
    }

    $setArg = Get-HelmSetArgsFromChartEntry -Chart $Chart -ChartVersion $ChartVersion
    $dryRunArg = if ($DryRun) { Get-HelmUpgradeDryRunArgs } else { @() }

    if ($DryRun) {
        if ($valuesArg.Count -gt 0) {
            Write-Host "Dry run: helm upgrade --install '$releaseName' in namespace '$Namespace' with values file $valuesPath (chart version $ChartVersion)"
        }
        else {
            Write-Host "Dry run: helm upgrade --install '$releaseName' in namespace '$Namespace' to chart version $ChartVersion"
        }
    }

    helm upgrade --install $releaseName $ociRef -n $Namespace --create-namespace --version $ChartVersion @reuseArg @valuesArg @setArg @dryRunArg
    if ($LASTEXITCODE -ne 0) {
        $action = if ($DryRun) { 'Helm dry-run upgrade/install' } else { 'Helm upgrade/install' }
        throw "$action failed for release '$releaseName' (exit code $LASTEXITCODE)."
    }
}

function Remove-BgpServices {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace,
        [Parameter(Mandatory = $true)]
        [string]$ScriptDir,
        [Parameter(Mandatory = $true)]
        [string]$ReleaseName,
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [object[]]$BgpServices,
        [Parameter(Mandatory = $true)]
        [int]$DefaultPort
    )

    foreach ($svc in $BgpServices) {
        $template = $svc.template
        $ip = $svc.ip
        $path = Join-Path $ScriptDir $template
        if (-not (Test-Path $path)) {
            Write-Host "BGP template not found (skip delete): $path"
            continue
        }

        Write-Host "Removing BGP service $template (IP: $ip)"
        $content = Get-Content $path -Raw
        $portStr = if ($null -ne $svc.port) { [string]$svc.port } else { [string]$DefaultPort }
        $content = $content -replace "__RELEASE_NAME__", $ReleaseName -replace "__NAMESPACE__", $Namespace -replace "__BGP_IP__", $ip -replace "__PORT__", $portStr
        $content | kubectl delete -f - --ignore-not-found 2>$null
    }
}

function Invoke-HelmReleaseUninstall {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace,
        [Parameter(Mandatory = $true)]
        [object]$Chart
    )

    $releaseName = [string]$Chart.releaseName
    if ([string]::IsNullOrWhiteSpace($releaseName)) {
        throw "Chart entry is missing releaseName."
    }

    if (-not (Test-HelmReleaseExists -Namespace $Namespace -ReleaseName $releaseName)) {
        Write-Host "Release '$releaseName' not found in namespace '$Namespace', nothing to uninstall."
        return
    }

    Write-Host "Uninstalling Helm release '$releaseName' from namespace '$Namespace' ..."
    $prevEap = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        helm uninstall $releaseName -n $Namespace 2>&1 | Out-Host
        if ($LASTEXITCODE -ne 0) {
            throw "helm uninstall failed for release '$releaseName' (exit code $LASTEXITCODE)."
        }
    }
    finally {
        $ErrorActionPreference = $prevEap
    }
}

function Wait-TcpConnectivity {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ComputerName,
        [Parameter(Mandatory = $true)]
        [int]$Port,
        [int]$TimeoutSeconds = 300,
        [int]$PollIntervalSeconds = 3
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        $result = Test-NetConnection -ComputerName $ComputerName -Port $Port -WarningAction SilentlyContinue
        if ($result.TcpTestSucceeded) {
            Write-Host "Connectivity OK (${ComputerName}:${Port})"
            return $true
        }

        Start-Sleep -Seconds $PollIntervalSeconds
    }

    Write-Warning "Timeout after ${TimeoutSeconds}s: no connectivity to ${ComputerName}:${Port}"
    return $false
}

function Set-BgpServices {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Namespace,
        [Parameter(Mandatory = $true)]
        [string]$ScriptDir,
        [Parameter(Mandatory = $true)]
        [string]$ReleaseName,
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [object[]]$BgpServices,
        [Parameter(Mandatory = $true)]
        [int]$DefaultPort
    )

    foreach ($svc in $BgpServices) {
        $template = $svc.template
        $ip = $svc.ip
        $path = Join-Path $ScriptDir $template
        if (-not (Test-Path $path)) {
            Write-Warning "BGP template not found: $path"
            continue
        }

        Write-Host "Applying BGP service $template (IP: $ip)"
        $content = Get-Content $path -Raw
        $portStr = if ($null -ne $svc.port) { [string]$svc.port } else { [string]$DefaultPort }
        $content = $content -replace "__RELEASE_NAME__", $ReleaseName -replace "__NAMESPACE__", $Namespace -replace "__BGP_IP__", $ip -replace "__PORT__", $portStr
        $content | kubectl apply -f -
        if ($LASTEXITCODE -ne 0) {
            throw "kubectl apply failed for BGP template $template"
        }
    }
}

function Test-BgpConnectivity {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [object[]]$BgpServices,
        [int]$TimeoutSeconds = 300,
        [int]$PollIntervalSeconds = 3
    )

    $toTest = @($BgpServices | Where-Object { $null -ne $_.port })
    if ($toTest.Count -eq 0) {
        Write-Warning "No BGP services have port set; skipping connectivity test."
        return
    }

    foreach ($svc in $toTest) {
        $h = $svc.ip
        $p = [int]$svc.port
        Write-Host "Waiting for connectivity to ${h}:${p}..."
        Wait-TcpConnectivity -ComputerName $h -Port $p -TimeoutSeconds $TimeoutSeconds -PollIntervalSeconds $PollIntervalSeconds | Out-Null
    }
}

Export-ModuleMember -Function `
    Confirm-HelmAndKubectlAvailable, `
    Set-K8sNamespace, `
    Wait-NamespacePodsReady, `
    Invoke-PostgresClusterWait, `
    Invoke-HelmRemoteChartUpgrade, `
    Invoke-HelmReleaseUninstall, `
    Set-BgpServices, `
    Remove-BgpServices, `
    Test-BgpConnectivity
