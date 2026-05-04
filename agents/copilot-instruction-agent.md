# Copilot Instruction Agent

## Table of Contents
- [Role](#role)
- [Input](#input)
- [Output](#output)
- [Generation Rules](#generation-rules)
- [Template Structure](#template-structure)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

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

## Generation Rules
1. Output MUST be Markdown
2. All rules must be derived from the AI-FACTORY-v2 profile
3. No placeholder text — every section must contain real constraints
4. Security section is mandatory (delegated to `security-agent`)
5. Instructions must be idempotent — re-running produces the same pack

## Template Structure

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

## Setup

1. Ensure you have access to the target repository.
2. Install necessary dependencies using `npm install` or `yarn`.
3. Verify that the `repo-analyzer-agent` is configured and operational.

## Configuration

- Set up your AI-FACTORY-v2 profile by editing the `config.json` file.
- Ensure the `security-agent` is properly integrated for security checks.

## Usage

1. Run the agent with the following command:
   ```bash
   node copilot-instruction-agent.js --repo <repository-url> --profile <profile-name>
   ```
2. Check the output in the `.github/copilot-instructions.md` file.

## Troubleshooting

- Ensure the `repo` path or URL is correct and accessible.
- Verify that the AI-FACTORY-v2 profile is correctly loaded.

## Examples

- Example input for generating instructions:
  ```json
  {
    "repo": "https://github.com/example/repo",
    "profile": "default",
    "analysis": "output from repo-analyzer-agent"
  }
  ```
- Example output structure:
  ```markdown
  # GitHub Copilot Instructions
  ## Agent Profile
  - Rule 1
  - Rule 2
  ```
