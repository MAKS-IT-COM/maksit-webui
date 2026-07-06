@echo off
setlocal
pwsh -NoProfile -File "%~dp0engines\release\Invoke-ReleasePackage.ps1" -Mode single %*
exit /b %ERRORLEVEL%
