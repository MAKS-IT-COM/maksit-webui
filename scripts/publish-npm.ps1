#requires -Version 7.0
# Publish @maksit/webui-* to registry.npmjs.org (maks-it.com org / @maksit scope).
# Requires: npm login or //registry.npmjs.org/:_authToken in ~/.npmrc, or NPMJS_MAKS_IT env var.

$ErrorActionPreference = 'Stop'

$workspaceRoot = Join-Path $PSScriptRoot '..' 'src' | Resolve-Path
$publishOrder = @(
  '@maksit/webui-contracts',
  '@maksit/webui-core',
  '@maksit/webui-components'
)

Push-Location $workspaceRoot
try {
  if (-not [string]::IsNullOrWhiteSpace($env:NPMJS_MAKS_IT)) {
  $tempNpmRc = Join-Path $workspaceRoot '.npmrc.publish-temp'
  @"
registry=https://registry.npmjs.org
//registry.npmjs.org/:_authToken=$($env:NPMJS_MAKS_IT)
"@ | Set-Content -Path $tempNpmRc -Encoding utf8 -NoNewline
    $npmUserConfig = @('--userconfig', $tempNpmRc)
  }
  else {
    $npmUserConfig = @()
    Write-Host 'NPMJS_MAKS_IT not set; using default npm auth (~/.npmrc or npm login).' -ForegroundColor Yellow
  }

  Write-Host 'Installing workspace dependencies...' -ForegroundColor Cyan
  npm ci @npmUserConfig
  if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }

  Write-Host 'Building packages...' -ForegroundColor Cyan
  npm run build @npmUserConfig
  if ($LASTEXITCODE -ne 0) { throw 'npm run build failed.' }

  foreach ($packageName in $publishOrder) {
    Write-Host "Publishing $packageName..." -ForegroundColor Cyan
    npm publish -w $packageName --access public @npmUserConfig
    if ($LASTEXITCODE -ne 0) { throw "npm publish failed for $packageName." }
    Write-Host "Published $packageName." -ForegroundColor Green
  }

  Write-Host 'All @maksit/webui-* packages published.' -ForegroundColor Green
}
finally {
  Pop-Location
  $tempNpmRc = Join-Path $workspaceRoot '.npmrc.publish-temp'
  if (Test-Path $tempNpmRc) {
    Remove-Item -Path $tempNpmRc -Force -ErrorAction SilentlyContinue
  }
}
