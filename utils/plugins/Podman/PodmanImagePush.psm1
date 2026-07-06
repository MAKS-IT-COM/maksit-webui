#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Podman image publish plugin — build and push images via podman (local podman CLI).

.DESCRIPTION
    Requires ContainerEngineProbe first. Skips safely when activeContainerEngine is docker.
    In CI, runs inside the spawned podman builder container (local nested podman, not CONTAINER_HOST).
    Builds any Dockerfile listed in images[]; not limited to .NET projects.
#>

if (-not (Get-Command Import-PluginDependency -ErrorAction SilentlyContinue)) {
    $srcDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
    $pluginSupportModulePath = Join-Path $srcDir 'modules/Engine/PluginSupport.psm1'
    if (Test-Path $pluginSupportModulePath -PathType Leaf) {
        Import-Module $pluginSupportModulePath -Force -Global -ErrorAction Stop
    }
}

function Invoke-Plugin {
    param(
        [Parameter(Mandatory = $true)]
        $Settings
    )

    Import-PluginDependency -ModuleName 'Logging' -RequiredCommand 'Write-Log'
    Import-PluginDependency -ModuleName 'ContainerEngineSupport' -RequiredCommand 'Test-ShouldRunContainerEnginePlugin'
    Import-PluginDependency -ModuleName 'ContainerImagePushSupport' -RequiredCommand 'Invoke-ContainerImagePush'

    $shared = $Settings.context
    if (-not (Test-ShouldRunContainerEnginePlugin -RequiredEngine 'podman' -SharedSettings $shared -PluginName 'PodmanImagePush')) {
        return
    }

    Invoke-ContainerImagePush -Settings $Settings -PluginDisplayName 'PodmanImagePush'
}

function Get-PluginMetadata {
    [pscustomobject]@{ mutatesRemote = $true }
}

Export-ModuleMember -Function Invoke-Plugin, Get-PluginMetadata
