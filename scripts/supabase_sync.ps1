# Sync schema to Supabase
# Usage: .\scripts\supabase_sync.ps1

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

Write-Host "Syncing schema to Supabase project: $ProjectId"

supabase db push --project-ref $ProjectId --db-url $env:SUPABASE_URL

Write-Host "Schema sync complete."
