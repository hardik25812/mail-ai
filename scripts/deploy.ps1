# PowerShell Deployment Script for Mail AI Backend

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "=== Mail AI Backend Deployment ==="
Write-Output "This script will help you deploy the Mail AI backend to GitHub and Vercel."

# 1. GitHub Push
Write-Output ""
Write-ColorOutput Yellow "Step 1: Push to GitHub"
$github_username = Read-Host "Enter your GitHub username"

$repo_name = Read-Host "Enter your repository name (default: mail-ai-backend)"
if ([string]::IsNullOrWhiteSpace($repo_name)) {
    $repo_name = "mail-ai-backend"
}

Write-Output "`nSetting up GitHub repository..."
git remote add origin "https://github.com/$github_username/$repo_name.git"

Write-Output "`nPushing code to GitHub..."
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput Green "Successfully pushed code to GitHub!"
} else {
    Write-ColorOutput Red "Failed to push code to GitHub. Please check your credentials and try again."
    exit 1
}

# 2. Vercel Deployment
Write-Output ""
Write-ColorOutput Yellow "Step 2: Deploy to Vercel"
$deploy_vercel = Read-Host "Do you want to deploy to Vercel now? (y/n)"

if ($deploy_vercel -eq "y") {
    Write-Output "`nInstalling Vercel CLI..."
    npm install -g vercel

    Write-Output "`nDeploying to Vercel..."
    vercel

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "Successfully deployed to Vercel!"
    } else {
        Write-ColorOutput Red "Failed to deploy to Vercel. Please check the error message above."
        exit 1
    }
}

# 3. Supabase RLS Setup
Write-Output ""
Write-ColorOutput Yellow "Step 3: Set up Row Level Security in Supabase"
$setup_rls = Read-Host "Have you run the setup-rls.sql script in the Supabase SQL Editor? (y/n)"

if ($setup_rls -eq "n") {
    Write-ColorOutput Red "Please run the setup-rls.sql script in the Supabase SQL Editor before continuing."
    Write-Output "You can find the script at: scripts/setup-rls.sql"
}

# 4. Environment Variables
Write-Output ""
Write-ColorOutput Yellow "Step 4: Configure Environment Variables"
Write-Output "Make sure you've set up the following environment variables in Vercel:"
Write-Output "- NEXT_PUBLIC_SUPABASE_URL"
Write-Output "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
Write-Output "- SUPABASE_SERVICE_ROLE_KEY"
Write-Output "- EMAIL_BISON_API_KEY"
Write-Output "- EMAIL_BISON_API_URL"
Write-Output "- N8N_WEBHOOK_URL"

Write-Output ""
Write-ColorOutput Green "Deployment process completed!"
Write-Output "Your Mail AI backend should now be ready for use."
