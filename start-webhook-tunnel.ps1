# PowerShell script to start the Email Bison webhook tunnel
# This makes it easy to set up ngrok for webhook testing on Windows

Write-Host "Starting Email Bison webhook tunnel..." -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Set the working directory to the script's location
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if ngrok is installed via npm
if (-not (Test-Path ".\node_modules\ngrok")) {
    Write-Host "Installing ngrok dependency..." -ForegroundColor Yellow
    npm install ngrok
}

# Run the webhook tunnel script
Write-Host "Running webhook tunnel setup script..." -ForegroundColor Green
node .\scripts\setup-webhook-tunnel.js

# Keep the window open if there was an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error starting webhook tunnel. See above for details." -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
