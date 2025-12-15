# PosePrompt Studio - Server Startup Script
# This script ensures both backend and frontend servers are running
# Run this script to start both servers automatically

Write-Host "🚀 Starting PosePrompt Studio Servers..." -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Function to check if server is responding
function Test-ServerHealth {
    param([string]$Url, [int]$TimeoutSeconds = 3)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Check if backend is already running
$backendRunning = Test-Port -Port 3001
if ($backendRunning) {
    $backendHealthy = Test-ServerHealth -Url "http://localhost:3001/api/health"
    if ($backendHealthy) {
        Write-Host "✅ Backend server is already running on port 3001" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port 3001 is in use but server not responding. Killing process..." -ForegroundColor Yellow
        $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
        $backendRunning = $false
    }
} else {
    Write-Host "📡 Starting backend server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 3
    
    # Wait for backend to be ready (max 30 seconds)
    $backendReady = $false
    for ($i = 0; $i -lt 10; $i++) {
        if (Test-ServerHealth -Url "http://localhost:3001/api/health") {
            $backendReady = $true
            Write-Host "✅ Backend server started successfully!" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 3
    }
    
    if (-not $backendReady) {
        Write-Host "❌ Backend server failed to start. Check server/.env file and dependencies." -ForegroundColor Red
    }
}

# Check if frontend is already running
$frontendRunning = Test-Port -Port 5173
if ($frontendRunning) {
    $frontendHealthy = Test-ServerHealth -Url "http://localhost:5173"
    if ($frontendHealthy) {
        Write-Host "✅ Frontend server is already running on port 5173" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port 5173 is in use but server not responding. Killing process..." -ForegroundColor Yellow
        $process = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
        $frontendRunning = $false
    }
} else {
    Write-Host "🌐 Starting frontend server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 5
    
    # Wait for frontend to be ready (max 30 seconds)
    $frontendReady = $false
    for ($i = 0; $i -lt 10; $i++) {
        if (Test-ServerHealth -Url "http://localhost:5173") {
            $frontendReady = $true
            Write-Host "✅ Frontend server started successfully!" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 3
    }
    
    if (-not $frontendReady) {
        Write-Host "❌ Frontend server failed to start. Check dependencies." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Keep the PowerShell windows open to keep servers running" -ForegroundColor Yellow
Write-Host "💡 Tip: Run this script again anytime to restart servers" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Open browser after a short delay
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
