# Test script for the Email Bison webhook endpoint
# This script simulates an incoming email webhook from Email Bison

# ======= CONFIGURATION =======
# Values from your Supabase database
$inboxId = "bison-1745405078801-bison"  # Email Bison inbox ID (not a UUID)
$userId = "023bc166-f045-4435-a724-5b812f54a2bf"  # User ID
$recipientEmail = "bison-1745405078801-bison@emailbison.com"  # This should match the inbox email in your database

# ======= WEBHOOK ENDPOINT =======
# Webhook endpoint URL (adjust port if needed)
$webhookUrl = "http://localhost:3001/api/email-bison-webhook"

# ======= PAYLOAD =======
# Create a payload that matches the expected format from Email Bison
$emailId = [guid]::NewGuid().ToString()
$webhookPayload = @{
    event_type = "email.received"
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    data = @{
        email_id = $emailId
        message_id = "<test-message-id-$([guid]::NewGuid().ToString())@example.com>"
        thread_id = "<test-thread-id-$([guid]::NewGuid().ToString())@example.com>"
        subject = "Test Email for Mail AI System"
        body = "Hello,

I recently came across your service and I'm interested in learning more about how it works. Could you please provide some information about your pricing plans and features?

Also, do you offer any trial periods for new users?

Thanks,
Test User"
        body_html = "<p>Hello,</p><p>I recently came across your service and I'm interested in learning more about how it works. Could you please provide some information about your pricing plans and features?</p><p>Also, do you offer any trial periods for new users?</p><p>Thanks,<br>Test User</p>"
        sender = "Test Sender <test.sender@example.com>"
        recipient = $recipientEmail
        inbox_id = $inboxId
        cc = @()
        bcc = @()
        received_at = (Get-Date).ToString("o")
        is_read = $false
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $webhookPayload -ContentType "application/json"
    
    # Display the response
    Write-Host "Response from webhook:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 4
    
    Write-Host "Test completed successfully!" -ForegroundColor Green
    Write-Host "Check your database for:" -ForegroundColor Yellow
    Write-Host "1. A new record in the 'emails' table" -ForegroundColor Yellow
    Write-Host "2. A new record in the 'ai_reply_jobs' table with status 'pending'" -ForegroundColor Yellow
} catch {
    Write-Host "Error sending webhook:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Make sure your Next.js server is running on port 3001" -ForegroundColor Red
}
