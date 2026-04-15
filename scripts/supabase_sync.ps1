# Supabase Sync
#
# Links the Supabase project and copies .env.local to sub-packages.
# Reads SUPABASE_PROJECT_ID from environment — no manual token input.
#
# Usage: powershell ./scripts/supabase_sync.ps1

Write-Output "🔄 Syncing Supabase config..."

if (-not $env:SUPABASE_PROJECT_ID) {
    Write-Error "❌ SUPABASE_PROJECT_ID is not set."
    Write-Output "   Add it to your .env.local or shell environment."
    exit 1
}

# Link project (reads access token from SUPABASE_ACCESS_TOKEN env var)
Write-Output "  🔗 Linking project: $env:SUPABASE_PROJECT_ID"
supabase link --project-ref $env:SUPABASE_PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ supabase link failed"
    exit $LASTEXITCODE
}

# Copy .env.local to any sub-packages that have a package.json
$root = $PSScriptRoot | Split-Path -Parent
$envSource = Join-Path $root ".env.local"

if (-not (Test-Path $envSource)) {
    Write-Warning "⚠️  .env.local not found at $envSource — skipping copy"
    exit 0
}

Get-ChildItem -Path $root -Directory | Where-Object {
    Test-Path (Join-Path $_.FullName "package.json")
} | ForEach-Object {
    $dest = Join-Path $_.FullName ".env.local"
    Copy-Item -Path $envSource -Destination $dest -Force
    Write-Output "  ✅ Synced .env.local → $($_.Name)"
}

Write-Output "🎉 Supabase sync complete"
