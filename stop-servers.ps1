# PosePrompt Studio - Stop All Servers Script
# This script stops both backend and frontend servers

Write-Host "🛑 Stopping PosePrompt Studio Servers..." -ForegroundColor Yellow
Write-Host ""

function Stop-ServerOnPort {
    param([int]$Port, [string]$Name)
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($processId in $processes) {
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Stopping $Name (PID: $processId)..." -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }
            } catch {
                Write-Host "Could not stop process $processId" -ForegroundColor Red
            }
        }
        Write-Host "✅ $Name stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  $Name is not running" -ForegroundColor Gray
    }
}

# Stop backend
Stop-ServerOnPort -Port 3001 -Name "Backend Server"

# Stop frontend
Stop-ServerOnPort -Port 5173 -Name "Frontend Server"

Write-Host ""
Write-Host "✅ All servers stopped" -ForegroundColor Green






