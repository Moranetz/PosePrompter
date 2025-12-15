# PosePrompt Studio - Server Health Check Script
# Run this script to check if both servers are running and healthy

Write-Host "🔍 Checking PosePrompt Studio Servers..." -ForegroundColor Cyan
Write-Host ""

function Test-ServerHealth {
    param([string]$Url, [string]$Name, [int]$TimeoutSeconds = 3)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name is running and healthy" -ForegroundColor Green
            Write-Host "   URL: $Url" -ForegroundColor Gray
            Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
            if ($Name -eq "Backend") {
                try {
                    $content = $response.Content | ConvertFrom-Json
                    Write-Host "   Stripe: $(if ($content.stripe) { '✅' } else { '❌' })" -ForegroundColor Gray
                    Write-Host "   Firebase: $(if ($content.firebase) { '✅' } else { '❌' })" -ForegroundColor Gray
                } catch {
                    # Not JSON, that's okay
                }
            }
            return $true
        } else {
            Write-Host "⚠️  $Name responded with status $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $Name is not responding" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Check backend
$backendHealthy = Test-ServerHealth -Url "http://localhost:3001/api/health" -Name "Backend"

Write-Host ""

# Check frontend
$frontendHealthy = Test-ServerHealth -Url "http://localhost:5173" -Name "Frontend"

Write-Host ""

if ($backendHealthy -and $frontendHealthy) {
    Write-Host "🎉 All servers are running correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Access your app at: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some servers are not running. Run start-servers.ps1 to start them." -ForegroundColor Yellow
}
