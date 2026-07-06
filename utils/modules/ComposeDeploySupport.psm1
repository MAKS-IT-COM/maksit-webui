#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Shared helpers for DockerCompose and PodmanCompose release plugins.
#>

$containerEngineSupportModulePath = Join-Path $PSScriptRoot 'ContainerEngineSupport.psm1'
if (Test-Path $containerEngineSupportModulePath -PathType Leaf) {
    Import-Module $containerEngineSupportModulePath -Force -Global
}

function Get-ComposeInvocation {
    param(
        [Parameter(Mandatory = $false)]
        [psobject]$SharedSettings = $null
    )

    if ($null -ne $SharedSettings -and $SharedSettings.PSObject.Properties.Name -contains 'containerEngineProbeCompleted' -and $SharedSettings.containerEngineProbeCompleted) {
        return Get-SharedComposeInvocation -SharedSettings $SharedSettings
    }

    if (Test-ComposeSubcommand 'docker') {
        return @{ Executable = 'docker'; BaseArgs = @('compose'); Engine = 'docker' }
    }

    if (Test-ComposeSubcommand 'podman') {
        return @{ Executable = 'podman'; BaseArgs = @('compose'); Engine = 'podman' }
    }

    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        return @{ Executable = 'docker-compose'; BaseArgs = @(); Engine = 'docker-compose' }
    }

    throw 'Compose is not available. Run ContainerEngineProbe first, or install docker compose / podman compose.'
}

function Resolve-ComposeProjectDirectory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptDir,

        [Parameter(Mandatory = $true)]
        [string]$ComposePath
    )

    $projectDir = [System.IO.Path]::GetFullPath((Join-Path $ScriptDir $ComposePath))
    if (-not (Test-Path $projectDir -PathType Container)) {
        throw "Compose project directory not found: $projectDir"
    }

    return $projectDir
}

function Get-ComposeFileArguments {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$ComposeFiles
    )

    if ($ComposeFiles.Count -eq 0) {
        throw 'At least one compose file is required.'
    }

    $args = New-Object System.Collections.Generic.List[string]
    foreach ($fileName in $ComposeFiles) {
        if ([string]::IsNullOrWhiteSpace($fileName)) {
            continue
        }

        $args.Add('-f')
        $args.Add([string]$fileName)
    }

    if ($args.Count -eq 0) {
        throw 'At least one non-empty compose file name is required.'
    }

    return @($args)
}

function Invoke-ComposeConfigValidation {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProjectDir,

        [Parameter(Mandatory = $true)]
        [string[]]$ComposeFiles,

        [Parameter(Mandatory = $false)]
        [psobject]$SharedSettings = $null
    )

    $compose = Get-ComposeInvocation -SharedSettings $SharedSettings
    $fileArgs = Get-ComposeFileArguments -ComposeFiles $ComposeFiles

    foreach ($fileName in $ComposeFiles) {
        $composeFilePath = Join-Path $ProjectDir $fileName
        if (-not (Test-Path $composeFilePath -PathType Leaf)) {
            throw "Compose file not found: $composeFilePath"
        }
    }

    $commandArgs = @($compose.BaseArgs) + $fileArgs + @('config', '--quiet')
    Write-Log -Level 'INFO' -Message "Validating Compose project at $ProjectDir ($($ComposeFiles -join ', ')) via $($compose.Engine) ..."

    Push-Location $ProjectDir
    try {
        $output = & $compose.Executable @commandArgs 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "$($compose.Engine) compose config failed: $($output | Out-String)"
        }
    }
    finally {
        Pop-Location
    }

    Write-Log -Level 'OK' -Message '  Compose configuration is valid.'
}

function Invoke-ComposeStackPlugin {
    param(
        [Parameter(Mandatory = $true)]
        $Settings,

        [Parameter(Mandatory = $true)]
        [ValidateSet('docker', 'podman')]
        [string]$RequiredEngine,

        [Parameter(Mandatory = $true)]
        [string]$PluginName
    )

    Import-PluginDependency -ModuleName 'Logging' -RequiredCommand 'Write-Log'
    Import-PluginDependency -ModuleName 'ContainerEngineSupport' -RequiredCommand 'Test-ShouldRunContainerEnginePlugin'

    $pluginSettings = $Settings
    $shared = $Settings.context
    $scriptDir = [string]$shared.scriptDir

    if (-not (Test-ShouldRunContainerEnginePlugin -RequiredEngine $RequiredEngine -SharedSettings $shared -PluginName $PluginName)) {
        return
    }

    if ([string]::IsNullOrWhiteSpace($pluginSettings.composePath)) {
        throw "$PluginName requires 'composePath' (directory with docker-compose.yml, relative to engines/release)."
    }

    $composeFiles = @('docker-compose.yml', 'docker-compose.override.yml')
    if ($pluginSettings.PSObject.Properties.Name -contains 'composeFiles' -and $null -ne $pluginSettings.composeFiles) {
        $composeFiles = @($pluginSettings.composeFiles | ForEach-Object { [string]$_ })
    }

    $projectDir = Resolve-ComposeProjectDirectory -ScriptDir $scriptDir -ComposePath ([string]$pluginSettings.composePath)
    Invoke-ComposeConfigValidation -ProjectDir $projectDir -ComposeFiles $composeFiles -SharedSettings $shared

    $dryRun = Test-PluginSkipsRemoteMutation -Plugin $pluginSettings -SharedSettings $shared
    if ($dryRun) {
        Write-Log -Level 'INFO' -Message 'Dry run: compose up/build skipped.'
        return
    }

    $compose = Get-ComposeInvocation -SharedSettings $shared
    $fileArgs = Get-ComposeFileArguments -ComposeFiles $composeFiles
    $upArgs = @($compose.BaseArgs) + $fileArgs + @('up', '--build', '-d')

    Write-Log -Level 'STEP' -Message "Starting Compose stack at $projectDir via $($compose.Engine) ..."
    Push-Location $projectDir
    try {
        $output = & $compose.Executable @upArgs 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "$($compose.Engine) compose up failed: $($output | Out-String)"
        }
    }
    finally {
        Pop-Location
    }

    Write-Log -Level 'OK' -Message "  Compose stack started via $($compose.Engine)."
    $shared | Add-Member -NotePropertyName composeDeployCompleted -NotePropertyValue $true -Force
}

Export-ModuleMember -Function `
    Get-ComposeInvocation, `
    Resolve-ComposeProjectDirectory, `
    Get-ComposeFileArguments, `
    Invoke-ComposeConfigValidation, `
    Invoke-ComposeStackPlugin
