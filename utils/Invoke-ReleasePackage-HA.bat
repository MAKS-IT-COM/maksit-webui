@echo off
setlocal
pwsh -NoProfile -File "%~dp0engines\release\Invoke-ReleasePackage.ps1" -Mode ha %*
exit /b %ERRORLEVEL%
