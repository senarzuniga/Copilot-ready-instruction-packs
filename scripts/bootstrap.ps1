# Bootstrap
#
# One-time setup: installs dependencies and prepares the environment.
#
# Usage: powershell ./scripts/bootstrap.ps1

Write-Output "🏗️  Bootstrapping AI Copilot Instruction Factory..."

$root = $PSScriptRoot | Split-Path -Parent

# 1. Install Node.js dependencies
Write-Output "📦 Installing Node.js dependencies..."
Set-Location $root
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ npm install failed"
    exit $LASTEXITCODE
}

# 2. Check Python dependencies
Write-Output "🐍 Checking Python dependencies..."
pip install python-dotenv --quiet

# 3. Check for .env.local
$envFile = Join-Path $root ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Warning "⚠️  .env.local not found."
    Write-Output "   Copy .env.local.example to .env.local and fill in your values:"
    Write-Output "     SUPABASE_URL=https://xxxx.supabase.co"
    Write-Output "     SUPABASE_ANON_KEY=your_anon_key"
    Write-Output "     SUPABASE_PROJECT_ID=your_project_id"
} else {
    Write-Output "✅ .env.local found"
}

# 4. Check SUPABASE_ACCESS_TOKEN
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Warning "⚠️  SUPABASE_ACCESS_TOKEN is not set in your shell environment."
    Write-Output "   Set it permanently with:"
    Write-Output "     setx SUPABASE_ACCESS_TOKEN `"sbp_xxx`""
} else {
    Write-Output "✅ SUPABASE_ACCESS_TOKEN is set"
}

Write-Output ""
Write-Output "🎉 Bootstrap complete. Run 'npm run start' to launch the factory."
