/**
 * Prompt Engine
 *
 * Builds structured prompts that can be sent to an LLM or used as
 * template inputs by the instruction-builder.
 */

/**
 * Build a Copilot instruction generation prompt.
 *
 * @param {object} params
 * @param {string} params.rules        - AI-FACTORY-v2 profile rules
 * @param {string} params.repo         - Repository path / name
 * @param {string} params.language     - Detected primary language
 * @param {string} params.framework    - Detected framework
 * @param {string[]} params.dependencies - Key dependencies
 * @returns {string} Rendered prompt string
 */
export function buildInstructionPrompt({
  rules,
  repo,
  language,
  framework,
  dependencies,
}) {
  return `You are an AI agent governed by the following profile:

---
${rules}
---

Generate a complete, ready-to-use GitHub Copilot instruction file for the repository described below.

Repository: ${repo}
Primary language: ${language}
Framework: ${framework}
Key dependencies: ${dependencies.join(", ")}

Requirements:
1. The output must be valid Markdown suitable for .github/copilot-instructions.md
2. Include sections: Agent Profile, Project Context, Coding Standards, Architecture Constraints, AI Behaviour Rules
3. All rules must be concrete and actionable — no placeholders
4. Enforce the agent profile rules in every section
5. Production-ready output only
6. Output the final instruction content directly (not a prompt, plan, ticket, or implementation brief)
7. Do NOT use labels or headings like "TASK:", "OBJECTIVE:", "SCOPE:", "ARCHITECTURE:", or "EXPECTED RESULT:"
8. Do NOT describe what should be built; instead, provide operating instructions the agent can follow immediately
9. Return only the final Markdown instruction file content, with no preface or explanation
`;
}

/**
 * Build a repository analysis prompt.
 *
 * @param {string} repoPath
 * @returns {string}
 */
export function buildAnalysisPrompt(repoPath) {
  return `Analyse the repository at: ${repoPath}

Return a JSON object with these fields:
- language (string)
- framework (string)
- packageManager (string)
- hasTests (boolean)
- hasCICD (boolean)
- entryPoints (string[])
- dependencies (string[])
- securityFlags (string[])

Be precise. Do not invent information — if unknown, use "unknown".`;
}

/**
 * Build a security validation prompt.
 *
 * @param {string} content - The artefact to validate
 * @returns {string}
 */
export function buildSecurityPrompt(content) {
  return `You are a security agent. Review the following generated content for:
- Hardcoded secrets or tokens
- Insecure patterns (eval, new Function, non-TLS URLs)
- Policy violations (raw env values, unparameterised SQL)

Content to review:
\`\`\`
${content}
\`\`\`

Return JSON: { "passed": boolean, "violations": string[], "sanitisedOutput": string }`;
}
