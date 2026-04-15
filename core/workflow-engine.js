/**
 * Workflow Engine — Orchestrator
 *
 * Coordinates the full agent pipeline:
 *   1. Load AI-FACTORY-v2 profile
 *   2. Analyse repository
 *   3. Generate Copilot instructions
 *   4. Validate with security agent
 *   5. Persist to Supabase
 */

import { loadProfile } from "../shared/repo-context.js";
import { runInstructionAgent } from "../agents/copilot-instruction-agent.js";
import { saveToSupabase } from "../supabase/client.js";
import { analyzeRepo, validateOutput } from "./agent-runtime.js";

/**
 * @param {{ task: string, repo: string }} input
 */
export async function runWorkflow(input) {
  console.log("🧠 Loading AI-FACTORY-v2 profile...");
  const profile = await loadProfile();
  console.log(`✅ Profile loaded (${profile.version})`);

  console.log("🔍 Analysing repository...");
  const analysis = await analyzeRepo(input.repo);

  console.log("📦 Running Copilot Instruction Agent...");
  const result = await runInstructionAgent({ input, profile, analysis });

  console.log("🔐 Running security validation...");
  const validation = await validateOutput(result.instructions, profile);

  if (!validation.passed) {
    console.error("❌ Security validation failed:");
    validation.violations.forEach((v) => console.error(`  - ${v}`));
    throw new Error("Security agent blocked the output. See violations above.");
  }

  console.log("💾 Saving to Supabase...");
  await saveToSupabase({
    type: "copilot_instructions",
    payload: {
      repo: result.repo,
      instructions: validation.sanitisedOutput,
      profile_version: profile.version,
      analysis,
    },
  });

  console.log("✅ Workflow complete");
  return validation.sanitisedOutput;
}

// ---------------------------------------------------------------------------
// Direct invocation: node core/workflow-engine.js
// ---------------------------------------------------------------------------

if (process.argv[1] && process.argv[1].endsWith("workflow-engine.js")) {
  const task = process.env["WORKFLOW_TASK"] ?? "generate_copilot_instructions";
  const repo = process.env["WORKFLOW_REPO"] ?? process.cwd();

  runWorkflow({ task, repo }).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
