# Test script for the Mail AI email incoming API endpoint
# This script simulates an incoming email directly to our API endpoint

# ======= CONFIGURATION =======
# Values from your Supabase database
$inboxId = "795bb0b7-328a-408b-aa80-57f65579d1d1"  # Use an existing inbox ID from the database
$userId = "023bc166-f045-4435-a724-5b812f54a2bf"  # User ID
$recipientEmail = "test-inbox@example.com"  # This should match the inbox email in your database

# ======= PAYLOAD =======
# Create a payload that matches the expected format for our API endpoint
$payload = @{
    subject = "Test Email for Mail AI System"
    body = "Hello,

I recently came across your service and I'm interested in learning more about how it works. Could you please provide some information about your pricing plans and features?

Also, do you offer any trial periods for new users?

Thanks,
Test User"
    body_html = "<p>Hello,</p><p>I recently came across your service and I'm interested in learning more about how it works. Could you please provide some information about your pricing plans and features?</p><p>Also, do you offer any trial periods for new users?</p><p>Thanks,<br>Test User</p>"
    sender = "test.user@example.com"
    recipient = $recipientEmail
    message_id = "<test-message-id-$([guid]::NewGuid().ToString())@example.com>"
    thread_id = "<test-thread-id-$([guid]::NewGuid().ToString())@example.com>"
    inbox_id = $inboxId
    user_id = $userId
} | ConvertTo-Json -Depth 10

Write-Host "Sending test email to API endpoint..." -ForegroundColor Cyan
Write-Host "Using inbox_id: $inboxId" -ForegroundColor Yellow
Write-Host "Using user_id: $userId" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/email-incoming" -Method Post -Body $payload -ContentType "application/json"
    
    # Display the response
    Write-Host "Response from API:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 4
    
    Write-Host "Test completed successfully!" -ForegroundColor Green
    Write-Host "Check your database for:" -ForegroundColor Yellow
    Write-Host "1. A new record in the 'emails' table" -ForegroundColor Yellow
    Write-Host "2. A new record in the 'ai_reply_jobs' table with status 'pending'" -ForegroundColor Yellow
} catch {
    Write-Host "Error sending request:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Make sure your Next.js server is running on port 3000" -ForegroundColor Red
}
