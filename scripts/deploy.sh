#!/bin/bash
# Deployment script for Mail AI Backend

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Mail AI Backend Deployment ===${NC}"
echo "This script will help you deploy the Mail AI backend to GitHub and Vercel."

# 1. GitHub Push
echo -e "\n${YELLOW}Step 1: Push to GitHub${NC}"
echo "Enter your GitHub username:"
read github_username

echo "Enter your repository name (default: mail-ai-backend):"
read repo_name
repo_name=${repo_name:-mail-ai-backend}

echo -e "\nSetting up GitHub repository..."
git remote add origin https://github.com/$github_username/$repo_name.git

echo -e "\nPushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Successfully pushed code to GitHub!${NC}"
else
  echo -e "${RED}Failed to push code to GitHub. Please check your credentials and try again.${NC}"
  exit 1
fi

# 2. Vercel Deployment
echo -e "\n${YELLOW}Step 2: Deploy to Vercel${NC}"
echo "Do you want to deploy to Vercel now? (y/n)"
read deploy_vercel

if [ "$deploy_vercel" = "y" ]; then
  echo -e "\nInstalling Vercel CLI..."
  npm install -g vercel

  echo -e "\nDeploying to Vercel..."
  vercel

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully deployed to Vercel!${NC}"
  else
    echo -e "${RED}Failed to deploy to Vercel. Please check the error message above.${NC}"
    exit 1
  fi
fi

# 3. Supabase RLS Setup
echo -e "\n${YELLOW}Step 3: Set up Row Level Security in Supabase${NC}"
echo "Have you run the setup-rls.sql script in the Supabase SQL Editor? (y/n)"
read setup_rls

if [ "$setup_rls" = "n" ]; then
  echo -e "${RED}Please run the setup-rls.sql script in the Supabase SQL Editor before continuing.${NC}"
  echo "You can find the script at: scripts/setup-rls.sql"
fi

# 4. Environment Variables
echo -e "\n${YELLOW}Step 4: Configure Environment Variables${NC}"
echo "Make sure you've set up the following environment variables in Vercel:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- EMAIL_BISON_API_KEY"
echo "- EMAIL_BISON_API_URL"
echo "- N8N_WEBHOOK_URL"

echo -e "\n${GREEN}Deployment process completed!${NC}"
echo "Your Mail AI backend should now be ready for use."
