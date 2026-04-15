# Copilot Instruction Agent

## Role
Generates GitHub Copilot instruction sets for a given repository.

## Input
- `repo`: absolute path or GitHub URL of the target repository
- `profile`: loaded AI-FACTORY-v2 rule set
- `analysis`: output from `repo-analyzer-agent`

## Output
A structured Copilot instruction pack containing:
- `.github/copilot-instructions.md`
- Repository coding standards
- Architecture constraints
- AI behaviour rules

## Generation rules
1. Output MUST be Markdown
2. All rules must be derived from the AI-FACTORY-v2 profile
3. No placeholder text — every section must contain real constraints
4. Security section is mandatory (delegated to `security-agent`)
5. Instructions must be idempotent — re-running produces the same pack

## Template structure

```markdown
# GitHub Copilot Instructions

## Agent Profile
<rules from AI-FACTORY-v2>

## Project Context
<derived from repo analysis>

## Coding Standards
- Modular architecture
- No hardcoded secrets
- Supabase shared client only

## Architecture Constraints
<derived from analysis>

## AI Behaviour Rules
<enforced by security-agent>
```
