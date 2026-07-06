#requires -Version 7.0
#requires -PSEdition Core

function Get-RepoUtilsSrcDirectory {
    return (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
}

function Get-RepoUtilsModulesDirectory {
    return Split-Path $PSScriptRoot -Parent
}

if (-not (Get-Command Write-Log -ErrorAction SilentlyContinue)) {
    $loggingModulePath = Join-Path (Get-RepoUtilsModulesDirectory) "Logging.psm1"
    if (Test-Path $loggingModulePath -PathType Leaf) {
        Import-Module $loggingModulePath -Force
    }
}

function Import-PluginDependency {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModuleName,

        [Parameter(Mandatory = $true)]
        [string]$RequiredCommand
    )

    if (Get-Command $RequiredCommand -ErrorAction SilentlyContinue) {
        return
    }

    $modulesDir = Get-RepoUtilsModulesDirectory
    $engineModuleDir = $PSScriptRoot
    $modulePath = Join-Path $modulesDir "$ModuleName.psm1"
    if (-not (Test-Path $modulePath -PathType Leaf)) {
        $modulePath = Join-Path $engineModuleDir "$ModuleName.psm1"
    }

    if (Test-Path $modulePath -PathType Leaf) {
        Import-Module $modulePath -Force -Global -ErrorAction Stop
    }

    if (-not (Get-Command $RequiredCommand -ErrorAction SilentlyContinue)) {
        throw "Required command '$RequiredCommand' is still unavailable after importing module '$ModuleName'."
    }
}

function Get-ConfiguredPlugins {
    param(
        [Parameter(Mandatory = $true)]
        [psobject]$Settings
    )

    if (-not $Settings.PSObject.Properties['plugins'] -or $null -eq $Settings.plugins) {
        return @()
    }

    if ($Settings.plugins -is [System.Collections.IEnumerable] -and -not ($Settings.plugins -is [string])) {
        return @($Settings.plugins)
    }

    return @($Settings.plugins)
}

function Get-PluginStageLabel {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin
    )

    if (-not $Plugin.PSObject.Properties['stageLabel'] -or [string]::IsNullOrWhiteSpace([string]$Plugin.stageLabel)) {
        return 'release'
    }

    return [string]$Plugin.stageLabel
}

function Get-PluginBranches {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin
    )

    if (-not $Plugin.PSObject.Properties['branches'] -or $null -eq $Plugin.branches) {
        return @()
    }

    if ($Plugin.branches -is [System.Collections.IEnumerable] -and -not ($Plugin.branches -is [string])) {
        return @($Plugin.branches | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    }

    if ([string]::IsNullOrWhiteSpace([string]$Plugin.branches)) {
        return @()
    }

    return @([string]$Plugin.branches)
}

function Test-PluginAllowedOnBranch {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $true)]
        [string]$CurrentBranch
    )

    $allowedBranches = Get-PluginBranches -Plugin $Plugin
    if ($allowedBranches.Count -eq 0) {
        return $true
    }

    if ($allowedBranches -contains '*') {
        return $true
    }

    return $allowedBranches -contains $CurrentBranch
}

function Get-MaksitOrchestrator {
    <#
    .SYNOPSIS
        Returns Compose/Kubernetes when MAKSIT_ORCHESTRATOR is set; otherwise $null (local dev — all plugins run).
    #>
    $raw = [Environment]::GetEnvironmentVariable('MAKSIT_ORCHESTRATOR')
    if ([string]::IsNullOrWhiteSpace($raw)) {
        return $null
    }

    switch ($raw.Trim().ToLowerInvariant()) {
        'compose' { return 'Compose' }
        'kubernetes' { return 'Kubernetes' }
        'k8s' { return 'Kubernetes' }
        default { return $raw.Trim() }
    }
}

function Get-PluginMetadataObject {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $true)]
        [string]$EngineDirectory
    )

    $modulePath = Resolve-PluginModulePath -Plugin $Plugin -EngineDirectory $EngineDirectory
    if (-not (Test-Path $modulePath -PathType Leaf)) {
        return $null
    }

    try {
        $moduleInfo = Import-Module $modulePath -Force -PassThru -ErrorAction Stop
        $metadataCommand = Get-Command -Name 'Get-PluginMetadata' -Module $moduleInfo.Name -ErrorAction SilentlyContinue
        if (-not $metadataCommand) {
            return $null
        }

        return & $metadataCommand
    }
    catch {
        return $null
    }
}

function Test-PluginSupportsOrchestrator {
    <#
    .SYNOPSIS
        When MAKSIT_ORCHESTRATOR is unset (local dev), returns $true for every plugin.
        When set (CI/ContainerBuilder), skips plugins whose orchestrators list excludes the active profile.
    #>
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $true)]
        [string]$EngineDirectory,

        [Parameter(Mandatory = $false)]
        [bool]$WriteLogs = $true
    )

    $orchestrator = Get-MaksitOrchestrator
    if ([string]::IsNullOrWhiteSpace($orchestrator)) {
        return $true
    }

    $allowed = @()
    if ($Plugin.PSObject.Properties.Name -contains 'orchestrators' -and $Plugin.orchestrators) {
        $allowed = @($Plugin.orchestrators | ForEach-Object { ([string]$_).Trim() } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    }
    else {
        $metadata = Get-PluginMetadataObject -Plugin $Plugin -EngineDirectory $EngineDirectory
        if ($null -ne $metadata -and $metadata.PSObject.Properties.Name -contains 'orchestrators' -and $metadata.orchestrators) {
            $allowed = @($metadata.orchestrators | ForEach-Object { ([string]$_).Trim() } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        }
    }

    if ($allowed.Count -eq 0) {
        return $true
    }

    if ($orchestrator -in $allowed) {
        return $true
    }

    if ($WriteLogs) {
        Write-Log -Level 'INFO' -Message "Skipping plugin '$($Plugin.name)' (requires orchestrator in: $($allowed -join ', '); active: $orchestrator)."
    }

    return $false
}

function Test-PluginMutatesRemote {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $false)]
        [string]$EngineDirectory
    )

    if ($null -eq $Plugin -or [string]::IsNullOrWhiteSpace([string]$Plugin.name)) {
        return $false
    }

    if ([string]::IsNullOrWhiteSpace($EngineDirectory)) {
        if ($Plugin.PSObject.Properties.Name -contains 'context' -and $null -ne $Plugin.context -and $Plugin.context.scriptDir) {
            $EngineDirectory = [string]$Plugin.context.scriptDir
        }
        elseif ($Plugin.PSObject.Properties.Name -contains 'scriptDir' -and -not [string]::IsNullOrWhiteSpace([string]$Plugin.scriptDir)) {
            $EngineDirectory = [string]$Plugin.scriptDir
        }
    }

    if ([string]::IsNullOrWhiteSpace($EngineDirectory)) {
        return $false
    }

    $modulePath = Resolve-PluginModulePath -Plugin $Plugin -EngineDirectory $EngineDirectory
    if (-not (Test-Path $modulePath -PathType Leaf)) {
        return $false
    }

    try {
        $moduleInfo = Import-Module $modulePath -Force -PassThru -ErrorAction Stop
        $metadataCommand = Get-Command -Name 'Get-PluginMetadata' -Module $moduleInfo.Name -ErrorAction SilentlyContinue
        if (-not $metadataCommand) {
            return $false
        }

        $metadata = & $metadataCommand
        if ($null -eq $metadata) {
            return $false
        }

        if ($metadata.PSObject.Properties.Name -contains 'mutatesRemote') {
            return [bool]$metadata.mutatesRemote
        }
    }
    catch {
        return $false
    }

    return $false
}

function Get-SecretEnvironmentValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    return [Environment]::GetEnvironmentVariable($Name)
}

function Resolve-PluginSecretName {
    param(
        [Parameter(Mandatory = $true)]
        $PluginSettings,

        [Parameter(Mandatory = $true)]
        [string]$PropertyName
    )

    if ($PluginSettings.PSObject.Properties.Name -contains $PropertyName) {
        $value = [string]$PluginSettings.$PropertyName
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            return $value.Trim()
        }
    }

    return $null
}

function Get-RegistryCredentialsFromRuntime {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SecretName,

        [Parameter(Mandatory = $false)]
        [psobject]$SharedSettings
    )

    $raw = Get-SecretEnvironmentValue -Name $SecretName
    if ([string]::IsNullOrWhiteSpace($raw)) {
        throw "Environment variable '$SecretName' is not set."
    }

    try {
        $decoded = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($raw))
    }
    catch {
        throw "Failed to decode '$SecretName' as Base64 (expected base64('username:password')): $($_.Exception.Message)"
    }

    $parts = $decoded -split ':', 2
    if ($parts.Count -ne 2 -or [string]::IsNullOrWhiteSpace($parts[0]) -or [string]::IsNullOrWhiteSpace($parts[1])) {
        throw "Decoded '$SecretName' must be in the form 'username:password'."
    }

    return @{ User = $parts[0]; Password = $parts[1] }
}

function Get-EngineDryRun {
    param(
        [Parameter(Mandatory = $false)]
        [psobject]$Settings
    )

    $envVal = [Environment]::GetEnvironmentVariable('MAKSIT_REPOUTILS_DRY_RUN')
    if (-not [string]::IsNullOrWhiteSpace($envVal)) {
        return @('1', 'true', 'yes') -contains $envVal.Trim().ToLowerInvariant()
    }

    if ($Settings -and $Settings.PSObject.Properties['dryRun'] -and $null -ne $Settings.dryRun) {
        return [bool]$Settings.dryRun
    }

    return $false
}

function Test-EngineDryRun {
    param(
        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings
    )

    if ($SharedSettings.PSObject.Properties.Name -contains 'dryRun') {
        return [bool]$SharedSettings.dryRun
    }

    return $false
}

function Test-PluginSkipsRemoteMutation {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings
    )

    $engineDirectory = [string]$SharedSettings.scriptDir
    return (Test-EngineDryRun -SharedSettings $SharedSettings) -and (Test-PluginMutatesRemote -Plugin $Plugin -EngineDirectory $engineDirectory)
}

function Test-IsPublishPlugin {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $false)]
        [string]$EngineDirectory
    )

    return Test-PluginMutatesRemote -Plugin $Plugin -EngineDirectory $EngineDirectory
}

function Get-PluginSettingValue {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Plugins,

        [Parameter(Mandatory = $true)]
        [string]$PropertyName
    )

    foreach ($plugin in $Plugins) {
        if ($null -eq $plugin -or [string]::IsNullOrWhiteSpace($plugin.name)) {
            continue
        }

        if (-not $plugin.PSObject.Properties[$PropertyName]) {
            continue
        }

        $value = $plugin.$PropertyName
        if ($null -eq $value) {
            continue
        }

        if ($value -is [string] -and [string]::IsNullOrWhiteSpace($value)) {
            continue
        }

        return $value
    }

    return $null
}

function Get-PluginPathListSetting {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Plugins,

        [Parameter(Mandatory = $true)]
        [string]$PropertyName,

        [Parameter(Mandatory = $true)]
        [string]$BasePath
    )

    $rawPaths = @()
    $value = Get-PluginSettingValue -Plugins $Plugins -PropertyName $PropertyName

    if ($null -eq $value) {
        return @()
    }

    if ($value -is [System.Collections.IEnumerable] -and -not ($value -is [string])) {
        $rawPaths += $value
    }
    else {
        $rawPaths += $value
    }

    $resolvedPaths = @()
    foreach ($path in $rawPaths) {
        if ([string]::IsNullOrWhiteSpace([string]$path)) {
            continue
        }

        $resolvedPaths += [System.IO.Path]::GetFullPath((Join-Path $BasePath ([string]$path)))
    }

    return @($resolvedPaths)
}

function Get-PluginPathSetting {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Plugins,

        [Parameter(Mandatory = $true)]
        [string]$PropertyName,

        [Parameter(Mandatory = $true)]
        [string]$BasePath
    )

    $value = Get-PluginSettingValue -Plugins $Plugins -PropertyName $PropertyName
    if ($null -eq $value -or [string]::IsNullOrWhiteSpace([string]$value)) {
        return $null
    }

    return [System.IO.Path]::GetFullPath((Join-Path $BasePath ([string]$value)))
}

function Get-ArchiveNamePattern {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Plugins,

        [Parameter(Mandatory = $true)]
        [string]$CurrentBranch
    )

    foreach ($plugin in $Plugins) {
        if ($null -eq $plugin -or [string]::IsNullOrWhiteSpace($plugin.name)) {
            continue
        }

        if (-not $plugin.enabled) {
            continue
        }

        if (-not (Test-PluginAllowedOnBranch -Plugin $plugin -CurrentBranch $CurrentBranch)) {
            continue
        }

        if ($plugin.PSObject.Properties['zipNamePattern'] -and -not [string]::IsNullOrWhiteSpace([string]$plugin.zipNamePattern)) {
            return [string]$plugin.zipNamePattern
        }
    }

    return "release-{version}.zip"
}

function Resolve-PluginModulePath {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $true)]
        [string]$EngineDirectory
    )

    $srcDir = Split-Path (Split-Path $EngineDirectory -Parent) -Parent
    $pluginsRoot = Join-Path $srcDir "plugins"
    $pluginFileName = "{0}.psm1" -f $Plugin.name
    $candidatePaths = @(
        (Join-Path (Join-Path $EngineDirectory "custom") $pluginFileName),
        (Join-Path (Join-Path $pluginsRoot "Platform") $pluginFileName),
        (Join-Path (Join-Path $pluginsRoot "Docker") $pluginFileName),
        (Join-Path (Join-Path $pluginsRoot "Podman") $pluginFileName),
        (Join-Path (Join-Path $pluginsRoot "Helm") $pluginFileName),
        (Join-Path (Join-Path $pluginsRoot "DotNet") $pluginFileName),
        (Join-Path (Join-Path $pluginsRoot "Npm") $pluginFileName)
    )

    foreach ($candidatePath in $candidatePaths) {
        if (Test-Path $candidatePath -PathType Leaf) {
            return $candidatePath
        }
    }

    return $candidatePaths[0]
}

function Test-PluginRunnable {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings,

        [Parameter(Mandatory = $true)]
        [string]$EngineDirectory,

        [Parameter(Mandatory = $false)]
        [bool]$WriteLogs = $true
    )

    if ($null -eq $Plugin -or [string]::IsNullOrWhiteSpace($Plugin.name)) {
        if ($WriteLogs) {
            Write-Log -Level "WARN" -Message "Skipping plugin entry with no name."
        }
        return $false
    }

    if (-not $Plugin.enabled) {
        if ($WriteLogs) {
            Write-Log -Level "WARN" -Message "Skipping plugin '$($Plugin.name)' (disabled)."
        }
        return $false
    }

    $pluginModulePath = Resolve-PluginModulePath -Plugin $Plugin -EngineDirectory $EngineDirectory
    if (-not (Test-Path $pluginModulePath -PathType Leaf)) {
        if ($WriteLogs) {
            Write-Log -Level "ERROR" -Message "Plugin module not found: $pluginModulePath"
        }
        return $false
    }

    return $true
}

function New-PluginInvocationSettings {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings
    )

    $properties = @{}
    foreach ($property in $Plugin.PSObject.Properties) {
        $properties[$property.Name] = $property.Value
    }

    $properties['context'] = $SharedSettings
    return [pscustomobject]$properties
}

function Invoke-ConfiguredPlugin {
    param(
        [Parameter(Mandatory = $true)]
        $Plugin,

        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings,

        [Parameter(Mandatory = $true)]
        [string]$EngineDirectory,

        [Parameter(Mandatory = $false)]
        [bool]$ContinueOnError = $false
    )

    if (-not (Test-PluginRunnable -Plugin $Plugin -SharedSettings $SharedSettings -EngineDirectory $EngineDirectory -WriteLogs:$true)) {
        if ($Plugin.enabled) {
            return $false
        }

        return $true
    }

    if ((Test-IsPublishPlugin -Plugin $Plugin) -and ($SharedSettings.PSObject.Properties.Name -contains 'skipPublishPlugins') -and $SharedSettings.skipPublishPlugins) {
        Write-Log -Level "INFO" -Message "Skipping plugin '$($Plugin.name)' (ReleasePublishGuard suppressed publish)."
        return $true
    }

    if (-not (Test-PluginSupportsOrchestrator -Plugin $Plugin -EngineDirectory $EngineDirectory -WriteLogs:$true)) {
        return $true
    }

    $pluginModulePath = Resolve-PluginModulePath -Plugin $Plugin -EngineDirectory $EngineDirectory
    Write-Log -Level "STEP" -Message "Running plugin '$($Plugin.name)'..."

    try {
        $moduleInfo = Import-Module $pluginModulePath -Force -PassThru -ErrorAction Stop
        $invokeCommand = Get-Command -Name "Invoke-Plugin" -Module $moduleInfo.Name -ErrorAction Stop
        $pluginSettings = New-PluginInvocationSettings -Plugin $Plugin -SharedSettings $SharedSettings

        & $invokeCommand -Settings $pluginSettings
        Write-Log -Level "OK" -Message "  Plugin '$($Plugin.name)' completed."
        return $true
    }
    catch {
        Write-Log -Level "ERROR" -Message "  Plugin '$($Plugin.name)' failed: $($_.Exception.Message)"
        return $false
    }
}

Export-ModuleMember -Function Import-PluginDependency, Get-ConfiguredPlugins, Get-PluginStageLabel, Get-PluginBranches, Get-MaksitOrchestrator, Get-PluginMetadataObject, Test-PluginSupportsOrchestrator, Test-PluginMutatesRemote, Resolve-PluginSecretName, Get-SecretEnvironmentValue, Get-RegistryCredentialsFromRuntime, Get-EngineDryRun, Test-EngineDryRun, Test-PluginSkipsRemoteMutation, Test-IsPublishPlugin, Get-PluginSettingValue, Get-PluginPathListSetting, Get-PluginPathSetting, Get-ArchiveNamePattern, Resolve-PluginModulePath, Test-PluginRunnable, New-PluginInvocationSettings, Invoke-ConfiguredPlugin
