# Altruria - Start Backend & Frontend Servers
# This script starts both the Django backend and static frontend server

Write-Host "======================================"
Write-Host "Altruria - Starting Servers"
Write-Host "======================================"
Write-Host ""

# Stop any existing processes on these ports
Write-Host "[1/3] Stopping any existing servers on ports 8000 and 5500..."
$processes = @(Get-NetTCPConnection -LocalPort 8000, 5500 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess)
if ($processes) {
    $processes | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}
Write-Host "[✓] Done"
Write-Host ""

# Start Backend Server
Write-Host "[2/3] Starting Django Backend on http://localhost:8000..."
Push-Location ".\backend"
.\venv\Scripts\Activate.ps1
Start-Process python -ArgumentList "manage.py", "runserver" -WindowStyle Normal
Start-Sleep -Seconds 3
Pop-Location
Write-Host "[✓] Django backend started"
Write-Host ""

# Start Frontend Server
Write-Host "[3/3] Starting Frontend Static Server on http://localhost:5500..."
Push-Location ".\frontend"
Start-Process python -ArgumentList "-m", "http.server", "5500" -WindowStyle Normal
Start-Sleep -Seconds 2
Pop-Location
Write-Host "[✓] Frontend server started"
Write-Host ""

Write-Host "======================================"
Write-Host "✓ All servers running!"
Write-Host "======================================"
Write-Host ""
Write-Host "URLs:"
Write-Host "  Frontend:  http://localhost:5500"
Write-Host "  API:       http://localhost:8000/api"
Write-Host ""
Write-Host "Admin:"
Write-Host "  URL:       http://localhost:8000/admin"
Write-Host "  Email:     admin@altruria.local"
Write-Host "  Password:  AdminPass123"
Write-Host ""
Write-Host "To stop servers, close both terminal windows."
Write-Host ""
