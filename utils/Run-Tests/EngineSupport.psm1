#requires -Version 7.0
#requires -PSEdition Core

if (-not (Get-Command Write-Log -ErrorAction SilentlyContinue)) {
    $loggingModulePath = Join-Path (Split-Path $PSScriptRoot -Parent) "Logging.psm1"
    if (Test-Path $loggingModulePath -PathType Leaf) {
        Import-Module $loggingModulePath -Force
    }
}

function New-EngineContext {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptDir,

        [Parameter(Mandatory = $true)]
        [string]$UtilsDir,

        [Parameter(Mandatory = $false)]
        [psobject]$Settings
    )

    $badgesDir = $null
    if ($Settings -and $Settings.PSObject.Properties['paths'] -and $Settings.paths.badgesDir) {
        $badgesDir = [System.IO.Path]::GetFullPath((Join-Path $ScriptDir ([string]$Settings.paths.badgesDir)))
    }

    return [pscustomobject]@{
        scriptDir = $ScriptDir
        utilsDir = $UtilsDir
        badgesDir = $badgesDir
    }
}

Export-ModuleMember -Function New-EngineContext
