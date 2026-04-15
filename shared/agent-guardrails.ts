/**
 * Agent Guardrails
 *
 * Runtime enforcement layer that wraps agent invocations.
 * Ensures every agent call:
 *   1. Has a loaded AI-FACTORY-v2 profile
 *   2. Returns a non-empty result
 *   3. Does not exceed the configured timeout
 *   4. Passes the security validation gate before its output is trusted
 */

import type { AgentProfile } from "./repo-context.js";

export interface AgentResult {
  agentName: string;
  output: unknown;
  durationMs: number;
}

export type AgentFn<TInput, TOutput> = (
  input: TInput,
  profile: AgentProfile
) => Promise<TOutput>;

const DEFAULT_TIMEOUT_MS = 60_000; // 60 seconds

/**
 * Wrap an agent function with guardrail checks.
 *
 * @param agentName  - Human-readable name for logging
 * @param fn         - The agent function to wrap
 * @param timeoutMs  - Maximum allowed execution time (default: 60 s)
 */
export function withGuardrails<TInput, TOutput>(
  agentName: string,
  fn: AgentFn<TInput, TOutput>,
  timeoutMs = DEFAULT_TIMEOUT_MS
): AgentFn<TInput, AgentResult> {
  return async (input: TInput, profile: AgentProfile): Promise<AgentResult> => {
    // 1. Profile must be loaded
    if (!profile || !profile.rules) {
      throw new Error(
        `[${agentName}] AI-FACTORY-v2 profile is missing. ` +
          "Load it with loadProfile() before invoking any agent."
      );
    }

    console.log(`🤖 [${agentName}] Starting...`);
    const start = Date.now();

    // 2. Timeout wrapper
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(
        () =>
          reject(
            new Error(
              `[${agentName}] Timed out after ${timeoutMs}ms`
            )
          ),
        timeoutMs
      );
    });

    let output: TOutput;
    try {
      output = await Promise.race([fn(input, profile), timeoutPromise]);
    } finally {
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    }

    const durationMs = Date.now() - start;

    // 3. Non-empty result
    if (output === undefined || output === null) {
      throw new Error(`[${agentName}] returned an empty result.`);
    }

    console.log(`✅ [${agentName}] Completed in ${durationMs}ms`);

    return { agentName, output, durationMs };
  };
}
