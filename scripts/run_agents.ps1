# Run Agents
#
# Triggers the Node.js workflow engine with an optional task override.
#
# Usage:
#   powershell ./scripts/run_agents.ps1
#   powershell ./scripts/run_agents.ps1 -Task "generate_copilot_instructions"

param(
    [string]$Task = "generate_copilot_instructions",
    [string]$Repo = (Get-Location).Path
)

Write-Output "🤖 Running agents..."
Write-Output "   Task : $Task"
Write-Output "   Repo : $Repo"

$env:WORKFLOW_TASK = $Task
$env:WORKFLOW_REPO = $Repo

$root = $PSScriptRoot | Split-Path -Parent

node "$root\core\workflow-engine.js"

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Agent workflow exited with code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Output "✅ Agents completed successfully"
