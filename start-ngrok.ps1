# PowerShell script to start ngrok tunnels for Mail AI application
# Following the rule: Log every action taken

Write-Host "Starting ngrok tunnels for Mail AI..."
Write-Host "Make sure your backend (port 3001) and frontend (port 3000) servers are running"

# Start ngrok for backend server (port 3001)
Write-Host "Starting tunnel for backend server (port 3001)..."
Start-Process -FilePath "ngrok" -ArgumentList "http", "3001", "--log=stdout" -WindowStyle Normal

# Wait a moment before starting the next tunnel
Start-Sleep -Seconds 2

# Start ngrok for frontend server (port 3000)
Write-Host "Starting tunnel for frontend server (port 3000)..."
Start-Process -FilePath "ngrok" -ArgumentList "http", "3000", "--log=stdout" -WindowStyle Normal

Write-Host "Ngrok tunnels started successfully!"
Write-Host "You can view the ngrok status and URLs at: http://localhost:4040"
Write-Host "Note: For the backend webhook URL, use: https://your-ngrok-url.ngrok.io/api/webhooks/email-bison"
