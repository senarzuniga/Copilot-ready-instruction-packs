/**
 * Copilot Instruction Agent
 *
 * Generates a GitHub Copilot instruction pack for a given repository,
 * enforced against the loaded AI-FACTORY-v2 profile.
 */

/**
 * @param {object} params
 * @param {{ repo: string, task: string }} params.input
 * @param {{ rules: string, version: string }} params.profile
 * @param {object} [params.analysis]
 * @returns {Promise<{ repo: string, instructions: string }>}
 */
export async function runInstructionAgent({ input, profile, analysis = {} }) {
  const framework = analysis.framework ?? "unknown";
  const language = analysis.language ?? "unknown";
  const dependencies = Array.isArray(analysis.dependencies)
    ? analysis.dependencies.join(", ")
    : "none detected";

  const instructions = `# GitHub Copilot Instructions

## Agent Profile (AI-FACTORY-v2 ${profile.version ?? "v2"})

${profile.rules}

---

## Project Context

- **Repository**: ${input.repo}
- **Language**: ${language}
- **Framework**: ${framework}
- **Key dependencies**: ${dependencies}

---

## Coding Standards

- Follow modular architecture — one responsibility per file
- No hardcoded secrets; use \`process.env.*\` references exclusively
- Use the shared Supabase client from \`supabase/client.js\` — never instantiate directly
- All async functions must handle errors explicitly (no unhandled rejections)
- Prefer named exports over default exports

---

## Architecture Constraints

- Entry point: \`launcher/launcher.py\` → \`core/workflow-engine.js\`
- Agent pipeline must be orchestrated by \`orchestrator.agent.md\` rules
- Supabase interactions go through \`supabase/client.js\` only
- Shared utilities live in \`shared/\`; never duplicate them

---

## AI Behaviour Rules

- ALWAYS load the AI-FACTORY-v2 profile before generating output
- ALWAYS validate output via the security agent before persisting
- NEVER expose environment variable values in generated files
- NEVER generate code that calls \`eval()\` or \`new Function()\`
- Output must be production-ready — no placeholder text

---

## Output Requirement

Generate production-ready code and documentation only.
Every generated artefact must pass the security-agent validation gate.
`;

  return {
    repo: input.repo,
    instructions,
  };
}
