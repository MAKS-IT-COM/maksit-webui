#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Container engine probe, shared pipeline state, and CLI helpers.

.DESCRIPTION
    ContainerEngineProbe sets mandatory shared context fields. Engine-specific plugins call
    Test-ShouldRunContainerEnginePlugin before running (safe skip when another engine is active).
#>

function Get-ContainerRemoteConnection {
    $containerHost = [Environment]::GetEnvironmentVariable('CONTAINER_HOST')
    $dockerHost = [Environment]::GetEnvironmentVariable('DOCKER_HOST')

    return @{
        ContainerHost = if ([string]::IsNullOrWhiteSpace($containerHost)) { $null } else { $containerHost.Trim() }
        DockerHost    = if ([string]::IsNullOrWhiteSpace($dockerHost)) { $null } else { $dockerHost.Trim() }
    }
}

function Test-ContainerEngineCli {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Executable
    )

    if (-not (Get-Command $Executable -ErrorAction SilentlyContinue)) {
        return $false
    }

    $null = & $Executable version 2>$null
    return $LASTEXITCODE -eq 0
}

function Test-ComposeSubcommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Executable
    )

    if (-not (Get-Command $Executable -ErrorAction SilentlyContinue)) {
        return $false
    }

    $null = & $Executable compose version 2>$null
    return $LASTEXITCODE -eq 0
}

function Resolve-ActiveContainerEngineState {
    $remote = Get-ContainerRemoteConnection
    $forced = [Environment]::GetEnvironmentVariable('MAKSIT_CONTAINER_ENGINE')
    if (-not [string]::IsNullOrWhiteSpace($forced)) {
        $forced = $forced.Trim().ToLowerInvariant()
    }

    $dockerEngineAvailable = Test-ContainerEngineCli 'docker'
    $podmanEngineAvailable = Test-ContainerEngineCli 'podman'

    $invocation = $null
    if ($forced -eq 'docker') {
        if (-not $dockerEngineAvailable) {
            throw 'MAKSIT_CONTAINER_ENGINE=docker but the docker CLI is not available.'
        }

        $invocation = New-ContainerEngineInvocation -Executable 'docker' -Engine 'docker' -Remote $remote
    }
    elseif ($forced -eq 'podman') {
        if (-not $podmanEngineAvailable) {
            throw 'MAKSIT_CONTAINER_ENGINE=podman but the podman CLI is not available.'
        }

        $invocation = New-ContainerEngineInvocation -Executable 'podman' -Engine 'podman' -Remote $remote
    }
    elseif ($remote.ContainerHost) {
        if ($podmanEngineAvailable) {
            $invocation = New-ContainerEngineInvocation -Executable 'podman' -Engine 'podman' -Remote $remote -UsesRemote $true
        }
        elseif ($dockerEngineAvailable) {
            $invocation = New-ContainerEngineInvocation -Executable 'docker' -Engine 'docker' -Remote $remote -UsesRemote $true
        }
        else {
            throw 'CONTAINER_HOST is set but neither podman nor docker CLI is on PATH.'
        }
    }
    elseif ($dockerEngineAvailable) {
        $invocation = New-ContainerEngineInvocation -Executable 'docker' -Engine 'docker' -Remote $remote
    }
    elseif ($podmanEngineAvailable) {
        $invocation = New-ContainerEngineInvocation -Executable 'podman' -Engine 'podman' -Remote $remote
    }
    elseif ($remote.DockerHost -and $dockerEngineAvailable) {
        $invocation = New-ContainerEngineInvocation -Executable 'docker' -Engine 'docker' -Remote $remote -UsesRemote $true
    }

    if ($null -eq $invocation) {
        throw 'No container engine found. Install Docker Desktop or Podman locally, or set CONTAINER_HOST to a remote Podman API.'
    }

    $composeInvocation = Resolve-ComposeInvocationForEngine -Engine $invocation.Engine -DockerEngineAvailable $dockerEngineAvailable -PodmanEngineAvailable $podmanEngineAvailable

    return @{
        ActiveContainerEngine = [string]$invocation.Engine
        DockerEngineAvailable = [bool]$dockerEngineAvailable
        PodmanEngineAvailable = [bool]$podmanEngineAvailable
        ContainerExecutable   = [string]$invocation.Executable
        ContainerRemoteLabel  = $invocation.RemoteLabel
        ComposeExecutable     = [string]$composeInvocation.Executable
        ComposeBaseArgs       = @($composeInvocation.BaseArgs)
        ComposeEngine         = [string]$composeInvocation.Engine
    }
}

function Resolve-ComposeInvocationForEngine {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Engine,

        [Parameter(Mandatory = $true)]
        [bool]$DockerEngineAvailable,

        [Parameter(Mandatory = $true)]
        [bool]$PodmanEngineAvailable
    )

    if ($Engine -eq 'docker' -and $DockerEngineAvailable -and (Test-ComposeSubcommand 'docker')) {
        return @{ Executable = 'docker'; BaseArgs = @('compose'); Engine = 'docker' }
    }

    if ($Engine -eq 'podman' -and $PodmanEngineAvailable -and (Test-ComposeSubcommand 'podman')) {
        return @{ Executable = 'podman'; BaseArgs = @('compose'); Engine = 'podman' }
    }

    if ($Engine -eq 'docker' -and (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        return @{ Executable = 'docker-compose'; BaseArgs = @(); Engine = 'docker-compose' }
    }

    throw "Compose is not available for active engine '$Engine'. Install docker compose or podman compose."
}

function New-ContainerEngineInvocation {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Executable,

        [Parameter(Mandatory = $true)]
        [string]$Engine,

        [Parameter(Mandatory = $true)]
        [hashtable]$Remote,

        [bool]$UsesRemote = $false
    )

    $remoteLabel = $null
    if ($Remote.ContainerHost) {
        $remoteLabel = "CONTAINER_HOST=$($Remote.ContainerHost)"
    }
    elseif ($Remote.DockerHost) {
        $remoteLabel = "DOCKER_HOST=$($Remote.DockerHost)"
    }

    return @{
        Executable  = $Executable
        Engine      = $Engine
        UsesRemote  = $UsesRemote -or [bool]$Remote.ContainerHost -or [bool]$Remote.DockerHost
        RemoteLabel = $remoteLabel
    }
}

function Set-ContainerEngineSharedState {
    param(
        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings,

        [Parameter(Mandatory = $true)]
        [hashtable]$State
    )

    $SharedSettings | Add-Member -NotePropertyName containerEngineProbeCompleted -NotePropertyValue $true -Force
    $SharedSettings | Add-Member -NotePropertyName activeContainerEngine -NotePropertyValue $State.ActiveContainerEngine -Force
    $SharedSettings | Add-Member -NotePropertyName dockerEngineAvailable -NotePropertyValue $State.DockerEngineAvailable -Force
    $SharedSettings | Add-Member -NotePropertyName podmanEngineAvailable -NotePropertyValue $State.PodmanEngineAvailable -Force
    $SharedSettings | Add-Member -NotePropertyName containerExecutable -NotePropertyValue $State.ContainerExecutable -Force

    if ($State.ContainerRemoteLabel) {
        $SharedSettings | Add-Member -NotePropertyName containerRemoteLabel -NotePropertyValue $State.ContainerRemoteLabel -Force
    }

    $SharedSettings | Add-Member -NotePropertyName composeExecutable -NotePropertyValue $State.ComposeExecutable -Force
    $SharedSettings | Add-Member -NotePropertyName composeBaseArgs -NotePropertyValue $State.ComposeBaseArgs -Force
    $SharedSettings | Add-Member -NotePropertyName composeEngine -NotePropertyValue $State.ComposeEngine -Force
}

function Assert-ContainerEngineProbeCompleted {
    param(
        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings
    )

    if (-not ($SharedSettings.PSObject.Properties.Name -contains 'containerEngineProbeCompleted') -or -not $SharedSettings.containerEngineProbeCompleted) {
        throw 'ContainerEngineProbe must run before container engine plugins. Add ContainerEngineProbe as the first enabled plugin in scriptSettings.json.'
    }
}

function Test-ShouldRunContainerEnginePlugin {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('docker', 'podman')]
        [string]$RequiredEngine,

        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings,

        [Parameter(Mandatory = $true)]
        [string]$PluginName
    )

    Assert-ContainerEngineProbeCompleted -SharedSettings $SharedSettings

    if ([string]$SharedSettings.activeContainerEngine -eq $RequiredEngine) {
        return $true
    }

    $engineAvailable = if ($RequiredEngine -eq 'docker') {
        [bool]$SharedSettings.dockerEngineAvailable
    }
    else {
        [bool]$SharedSettings.podmanEngineAvailable
    }

    Write-Log -Level 'INFO' -Message "Skipping $PluginName (requires $RequiredEngine; active engine: $($SharedSettings.activeContainerEngine); ${RequiredEngine} CLI available: $engineAvailable)."
    return $false
}

function Get-SharedContainerEngineInvocation {
    param(
        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings
    )

    Assert-ContainerEngineProbeCompleted -SharedSettings $SharedSettings

    return @{
        Executable  = [string]$SharedSettings.containerExecutable
        Engine      = [string]$SharedSettings.activeContainerEngine
        RemoteLabel = if ($SharedSettings.PSObject.Properties.Name -contains 'containerRemoteLabel') { [string]$SharedSettings.containerRemoteLabel } else { $null }
    }
}

function Get-SharedComposeInvocation {
    param(
        [Parameter(Mandatory = $true)]
        [psobject]$SharedSettings
    )

    Assert-ContainerEngineProbeCompleted -SharedSettings $SharedSettings

    return @{
        Executable = [string]$SharedSettings.composeExecutable
        BaseArgs   = @($SharedSettings.composeBaseArgs)
        Engine     = [string]$SharedSettings.composeEngine
    }
}

function Get-ContainerEngineDisplayName {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Engine
    )

    if ($Engine.RemoteLabel) {
        return "$($Engine.Engine) ($($Engine.RemoteLabel))"
    }

    return [string]$Engine.Engine
}

function Invoke-ContainerEngine {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Engine,

        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$ArgumentList
    )

    & $Engine.Executable @ArgumentList
    return $LASTEXITCODE
}

function Invoke-ContainerEngineWithInput {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Engine,

        [Parameter(Mandatory = $true)]
        [string]$InputObject,

        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$ArgumentList
    )

    $InputObject | & $Engine.Executable @ArgumentList 2>&1
}

Export-ModuleMember -Function `
    Get-ContainerRemoteConnection, `
    Resolve-ActiveContainerEngineState, `
    Set-ContainerEngineSharedState, `
    Assert-ContainerEngineProbeCompleted, `
    Test-ShouldRunContainerEnginePlugin, `
    Get-SharedContainerEngineInvocation, `
    Get-SharedComposeInvocation, `
    Get-ContainerEngineDisplayName, `
    Invoke-ContainerEngine, `
    Invoke-ContainerEngineWithInput, `
    Test-ContainerEngineCli, `
    Test-ComposeSubcommand
