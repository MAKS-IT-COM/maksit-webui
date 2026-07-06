@echo off
setlocal
pwsh -NoProfile -File "%~dp0engines\uninstall\Invoke-UninstallEngine.ps1" -Mode ha %*
exit /b %ERRORLEVEL%
