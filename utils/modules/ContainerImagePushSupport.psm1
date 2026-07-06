#requires -Version 7.0
#requires -PSEdition Core

<#
.SYNOPSIS
    Shared container image build/push logic for DockerImagePush and PodmanImagePush.
#>

$containerEngineSupportModulePath = Join-Path $PSScriptRoot 'ContainerEngineSupport.psm1'
if (Test-Path $containerEngineSupportModulePath -PathType Leaf) {
    Import-Module $containerEngineSupportModulePath -Force -Global
}

function Set-ContainerImageEnvVersionValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $true)]
        [string]$Version
    )

    $content = Get-Content -LiteralPath $FilePath -Raw
    if ($content -match '(?m)^\s*VITE_APP_VERSION\s*=') {
        $content = $content -replace '(?m)^\s*VITE_APP_VERSION\s*=.*$', "VITE_APP_VERSION=$Version"
    }
    else {
        $separator = if ($content -match "(\r?\n)$") { '' } else { [Environment]::NewLine }
        $content = "$content${separator}VITE_APP_VERSION=$Version"
    }

    Set-Content -LiteralPath $FilePath -Value $content -NoNewline
}

function Invoke-ContainerImagePush {
    param(
        [Parameter(Mandatory = $true)]
        $Settings,

        [Parameter(Mandatory = $true)]
        [string]$PluginDisplayName
    )

    Import-PluginDependency -ModuleName 'Logging' -RequiredCommand 'Write-Log'
    Import-PluginDependency -ModuleName 'ContainerEngineSupport' -RequiredCommand 'Get-SharedContainerEngineInvocation'

    $pluginSettings = $Settings
    $shared = $Settings.context
    $dryRun = Test-PluginSkipsRemoteMutation -Plugin $pluginSettings -SharedSettings $shared
    $engine = Get-SharedContainerEngineInvocation -SharedSettings $shared
    $engineName = Get-ContainerEngineDisplayName -Engine $engine

    if ([string]::IsNullOrWhiteSpace($pluginSettings.registryUrl)) {
        throw "$PluginDisplayName requires 'registryUrl' (registry hostname, no scheme)."
    }

    $containerRegistrySecret = Resolve-PluginSecretName -PluginSettings $pluginSettings -PropertyName 'containerRegistrySecret'
    if ([string]::IsNullOrWhiteSpace($containerRegistrySecret)) {
        throw "$PluginDisplayName requires 'containerRegistrySecret' (logical secret name, e.g. ContainerRegistry)."
    }

    if ([string]::IsNullOrWhiteSpace($pluginSettings.projectName)) {
        throw "$PluginDisplayName requires 'projectName' (image path segment after registry)."
    }

    if ([string]::IsNullOrWhiteSpace($pluginSettings.contextPath)) {
        throw "$PluginDisplayName requires 'contextPath' (build context, relative to engines/release folder)."
    }

    if (-not $pluginSettings.images -or @($pluginSettings.images).Count -eq 0) {
        throw "$PluginDisplayName requires a non-empty 'images' array with 'service' and 'dockerfile' per entry."
    }

    $scriptDir = $shared.scriptDir
    $contextPath = [System.IO.Path]::GetFullPath((Join-Path $scriptDir ([string]$pluginSettings.contextPath)))
    if (-not (Test-Path $contextPath -PathType Container)) {
        throw "Build context directory not found: $contextPath"
    }

    $registryUrl = [string]$pluginSettings.registryUrl.TrimEnd('/')

    $bareVersion = $null
    if ($shared.PSObject.Properties.Name -contains 'version' -and -not [string]::IsNullOrWhiteSpace([string]$shared.version)) {
        $bareVersion = ([string]$shared.version).Trim() -replace '^[vV]', ''
    }
    if ([string]::IsNullOrWhiteSpace($bareVersion) -and $shared.PSObject.Properties.Name -contains 'tag') {
        $bareVersion = ([string]$shared.tag).Trim() -replace '^[vV]', ''
    }
    if ([string]::IsNullOrWhiteSpace($bareVersion)) {
        throw "${PluginDisplayName}: could not derive version tag (need shared.version from a version plugin or shared.tag)."
    }

    if ($dryRun) {
        foreach ($img in @($pluginSettings.images)) {
            if ($null -eq $img.service -or $null -eq $img.dockerfile) {
                throw "Each images[] entry must define 'service' and 'dockerfile'."
            }

            $service = [string]$img.service
            $dockerfileRel = [string]$img.dockerfile
            $imgContextPath = $contextPath
            if ($img.PSObject.Properties.Name -contains 'contextPath' -and -not [string]::IsNullOrWhiteSpace([string]$img.contextPath)) {
                $imgContextPath = [System.IO.Path]::GetFullPath((Join-Path $scriptDir ([string]$img.contextPath)))
            }

            $dockerfilePath = [System.IO.Path]::GetFullPath((Join-Path $imgContextPath $dockerfileRel))
            if (-not (Test-Path $dockerfilePath -PathType Leaf)) {
                throw "Dockerfile not found: $dockerfilePath"
            }

            $plannedRef = "$registryUrl/$($pluginSettings.projectName)/${service}:$bareVersion"
            Write-Log -Level 'INFO' -Message "Dry run: would build and push $plannedRef via $engineName (dockerfile: $dockerfilePath)"
        }

        Write-Log -Level 'OK' -Message "  $PluginDisplayName dry run completed."
        return
    }

    $creds = Get-RegistryCredentialsFromRuntime -SecretName $containerRegistrySecret -SharedSettings $shared

    $imageTags = New-Object System.Collections.Generic.List[string]
    function Add-ImageTag([System.Collections.Generic.List[string]]$List, [string]$Tag) {
        if ([string]::IsNullOrWhiteSpace($Tag)) { return }
        if (-not $List.Contains($Tag)) { [void]$List.Add($Tag) }
    }
    Add-ImageTag $imageTags $bareVersion
    Add-ImageTag $imageTags "v$bareVersion"
    if ($shared.PSObject.Properties.Name -contains 'tag') {
        Add-ImageTag $imageTags ([string]$shared.tag).Trim()
    }
    $pushLatest = if ($null -ne $pluginSettings.pushLatest) { [bool]$pluginSettings.pushLatest } else { $true }
    if ($pushLatest) {
        Add-ImageTag $imageTags 'latest'
    }

    Write-Log -Level 'STEP' -Message "Container login to $registryUrl via $engineName..."
    $loginResult = Invoke-ContainerEngineWithInput -Engine $engine -InputObject $creds.Password login $registryUrl -u $creds.User --password-stdin
    if ($LASTEXITCODE -ne 0 -or ($loginResult -notmatch 'Login Succeeded')) {
        throw "Container login failed for ${registryUrl}: $loginResult"
    }

    try {
        foreach ($img in @($pluginSettings.images)) {
            if ($null -eq $img.service -or $null -eq $img.dockerfile) {
                throw "Each images[] entry must define 'service' and 'dockerfile'."
            }

            $service = [string]$img.service
            $dockerfileRel = [string]$img.dockerfile

            $imgContextPath = $contextPath
            if ($img.PSObject.Properties.Name -contains 'contextPath' -and -not [string]::IsNullOrWhiteSpace([string]$img.contextPath)) {
                $imgContextPath = [System.IO.Path]::GetFullPath((Join-Path $scriptDir ([string]$img.contextPath)))
                if (-not (Test-Path $imgContextPath -PathType Container)) {
                    throw "Build context directory not found for image '$service': $imgContextPath"
                }
            }

            $dockerfilePath = [System.IO.Path]::GetFullPath((Join-Path $imgContextPath $dockerfileRel))
            if (-not (Test-Path $dockerfilePath -PathType Leaf)) {
                throw "Dockerfile not found: $dockerfilePath"
            }
            $baseName = "$registryUrl/$($pluginSettings.projectName)/$service"

            $versionEnvFiles = @()
            if ($img.PSObject.Properties.Name -contains 'versionEnvFiles' -and $null -ne $img.versionEnvFiles) {
                foreach ($relativeEnvFile in @($img.versionEnvFiles)) {
                    if ([string]::IsNullOrWhiteSpace([string]$relativeEnvFile)) {
                        continue
                    }

                    $envFilePath = [System.IO.Path]::GetFullPath((Join-Path $imgContextPath ([string]$relativeEnvFile)))
                    if (-not (Test-Path -LiteralPath $envFilePath -PathType Leaf)) {
                        throw "Configured versionEnvFiles entry not found: $envFilePath"
                    }

                    $backupPath = "$envFilePath.repoutils.bak"
                    Copy-Item -LiteralPath $envFilePath -Destination $backupPath -Force
                    $versionEnvFiles += [pscustomobject]@{
                        FilePath   = $envFilePath
                        BackupPath = $backupPath
                    }
                }
            }

            try {
                foreach ($envFile in $versionEnvFiles) {
                    Write-Log -Level 'INFO' -Message "Temporarily setting VITE_APP_VERSION=$bareVersion in $($envFile.FilePath)"
                    Set-ContainerImageEnvVersionValue -FilePath $envFile.FilePath -Version $bareVersion
                }

                $primaryRef = "${baseName}:$($imageTags[0])"
                Write-Log -Level 'STEP' -Message "Building $primaryRef via $engineName ..."
                $buildExitCode = Invoke-ContainerEngine -Engine $engine build -t $primaryRef -f $dockerfilePath $imgContextPath
                if ($buildExitCode -ne 0) {
                    throw "Container build failed for $primaryRef"
                }

                Write-Log -Level 'STEP' -Message "Pushing $primaryRef via $engineName ..."
                $pushExitCode = Invoke-ContainerEngine -Engine $engine push $primaryRef
                if ($pushExitCode -ne 0) {
                    throw "Container push failed for $primaryRef"
                }

                for ($ti = 1; $ti -lt $imageTags.Count; $ti++) {
                    $aliasRef = "${baseName}:$($imageTags[$ti])"
                    Write-Log -Level 'STEP' -Message "Tagging and pushing $aliasRef via $engineName ..."
                    $tagExitCode = Invoke-ContainerEngine -Engine $engine tag $primaryRef $aliasRef
                    if ($tagExitCode -ne 0) {
                        throw "Container tag failed: $primaryRef -> $aliasRef"
                    }
                    $aliasPushExitCode = Invoke-ContainerEngine -Engine $engine push $aliasRef
                    if ($aliasPushExitCode -ne 0) {
                        throw "Container push failed for $aliasRef"
                    }
                }
            }
            finally {
                foreach ($envFile in $versionEnvFiles) {
                    if (Test-Path -LiteralPath $envFile.BackupPath -PathType Leaf) {
                        Move-Item -LiteralPath $envFile.BackupPath -Destination $envFile.FilePath -Force
                    }
                }
                foreach ($envFile in $versionEnvFiles) {
                    if (Test-Path -LiteralPath $envFile.BackupPath -PathType Leaf) {
                        Remove-Item -LiteralPath $envFile.BackupPath -Force -ErrorAction SilentlyContinue
                    }
                }
            }
        }
    }
    finally {
        $null = Invoke-ContainerEngine -Engine $engine logout $registryUrl
    }

    Write-Log -Level 'OK' -Message "  $PluginDisplayName completed."
    $shared | Add-Member -NotePropertyName publishCompleted -NotePropertyValue $true -Force
}

Export-ModuleMember -Function Invoke-ContainerImagePush
