# Deploy Supabase Edge Functions
#
# Reads SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_ID from the
# machine environment — no tokens are passed as script arguments.
#
# Usage: powershell ./scripts/deploy_functions.ps1

Write-Output "🚀 Deploying Supabase Edge Functions..."

if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Error "❌ SUPABASE_ACCESS_TOKEN is not set."
    Write-Output "   Run: setx SUPABASE_ACCESS_TOKEN `"sbp_xxx`""
    exit 1
}

if (-not $env:SUPABASE_PROJECT_ID) {
    Write-Error "❌ SUPABASE_PROJECT_ID is not set."
    Write-Output "   Add SUPABASE_PROJECT_ID to your .env.local or shell environment."
    exit 1
}

$functions = @("save-instructions", "generate-pack")

foreach ($fn in $functions) {
    Write-Output "  📦 Deploying: $fn"
    supabase functions deploy $fn `
        --project-ref $env:SUPABASE_PROJECT_ID `
        --token $env:SUPABASE_ACCESS_TOKEN

    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Failed to deploy function: $fn"
        exit $LASTEXITCODE
    }

    Write-Output "  ✅ $fn deployed"
}

Write-Output "🎉 All Edge Functions deployed successfully"
