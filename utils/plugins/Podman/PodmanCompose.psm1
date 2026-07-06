#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Podman Compose plugin — validate or bring up the stack via podman compose.

.DESCRIPTION
    Requires ContainerEngineProbe first. Skips safely when activeContainerEngine is docker.
    Orchestrator filtering (Compose-only) applies only when MAKSIT_ORCHESTRATOR is set (CI).
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

    Import-PluginDependency -ModuleName 'ComposeDeploySupport' -RequiredCommand 'Invoke-ComposeStackPlugin'
    Invoke-ComposeStackPlugin -Settings $Settings -RequiredEngine 'podman' -PluginName 'PodmanCompose'
}

function Get-PluginMetadata {
    [pscustomobject]@{ mutatesRemote = $true; orchestrators = @('Compose') }
}

Export-ModuleMember -Function Invoke-Plugin, Get-PluginMetadata
