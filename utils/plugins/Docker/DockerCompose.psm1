#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Docker Compose plugin — validate or bring up the stack via docker compose.

.DESCRIPTION
    Requires ContainerEngineProbe first. Skips safely when activeContainerEngine is podman.
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
    Invoke-ComposeStackPlugin -Settings $Settings -RequiredEngine 'docker' -PluginName 'DockerCompose'
}

function Get-PluginMetadata {
    [pscustomobject]@{ mutatesRemote = $true; orchestrators = @('Compose') }
}

Export-ModuleMember -Function Invoke-Plugin, Get-PluginMetadata
