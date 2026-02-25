$DashboardPath = "g:\My Drive\Projects\MasterDashboard"
Set-Location $DashboardPath

Write-Host "--- REACHING CRITICAL MASS: STARTING MASTER COMMAND CENTER ---" -ForegroundColor Cyan

# Check if node_modules exist
if (!(Test-Path "$DashboardPath\node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the dev server
npm run dev
