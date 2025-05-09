# Script to start the AI Reply Generator Worker
# This will continuously poll for pending jobs and process them

Write-Host "Starting AI Reply Generator Worker..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the worker" -ForegroundColor Yellow
Write-Host ""

# Use ts-node to run the TypeScript file directly
try {
    Write-Host "Worker is now running and polling for jobs..." -ForegroundColor Green
    npx ts-node workers/generate-ai-reply.ts
} catch {
    Write-Host "Error starting worker:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
