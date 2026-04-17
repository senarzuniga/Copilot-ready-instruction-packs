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
 * Build a deterministic execution agent prompt for a given task.
 *
 * @param {object} params
 * @param {string} params.task          - The raw task description
 * @param {string} params.taskType      - Detected task type (CODE | DATA | BUSINESS | GENERIC)
 * @param {string[]} params.constraints - Extracted constraints
 * @param {string} params.outputType    - Inferred output format
 * @param {string[]} params.assumptions - Explicit assumptions made
 * @returns {string} Rendered prompt string
 */
export function buildDeterministicPrompt({
  task,
  taskType,
  constraints,
  outputType,
  assumptions,
}) {
  const constraintBlock =
    constraints.length > 0
      ? constraints.map((c) => `- ${c}`).join('\n')
      : '- None identified';

  const assumptionBlock =
    assumptions.length > 0
      ? assumptions.map((a) => `- ${a}`).join('\n')
      : '- None';

  return `You are a Deterministic AI Execution Agent.

Execute the following task through the mandatory pipeline:
UNDERSTAND → STRUCTURE → GENERATE → VALIDATE → REFINE → OUTPUT

## Task
${task}

## Detected Task Type
${taskType}

## Constraints
${constraintBlock}

## Explicit Assumptions
${assumptionBlock}

## Required Output Format
${outputType}

## Rules
1. Output MUST follow the standard envelope: RESULT / STRUCTURE USED / ASSUMPTIONS / VALIDATION CHECK
2. All sections must be complete and actionable — no placeholder text
3. Validate before returning: completeness ✅, structure ✅, actionability ✅
4. If any validation gate fails, refine internally (max 3 iterations) before outputting
5. Return the final output only — no meta-commentary
`;
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
