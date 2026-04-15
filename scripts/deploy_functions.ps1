# Deploy Supabase Edge Functions
# Usage: .\scripts\deploy_functions.ps1

param(
    [string]$ProjectId = $env:SUPABASE_PROJECT_ID,
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

if (-not $ProjectId) {
    Write-Error "SUPABASE_PROJECT_ID is not set."
    exit 1
}

if (-not $AccessToken) {
    Write-Error "SUPABASE_ACCESS_TOKEN is not set."
    exit 1
}

Write-Host "Deploying Supabase functions for project: $ProjectId"

supabase functions deploy --project-ref $ProjectId

Write-Host "Deployment complete."
