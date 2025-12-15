@echo off
REM PosePrompt Studio - Quick Start Batch File
REM Double-click this file to start both servers

echo Starting PosePrompt Studio Servers...
powershell -ExecutionPolicy Bypass -File "%~dp0start-servers.ps1"
pause
