@echo off
powershell.exe -NoProfile -File "%~dp0lancer-immersion.ps1"
if errorlevel 1 pause
