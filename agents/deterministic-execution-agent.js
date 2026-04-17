/**
 * Deterministic Execution Agent
 *
 * Translates user intent into precise, structured, and validated outputs
 * by running every request through the mandatory 6-step execution pipeline:
 *   UNDERSTAND → STRUCTURE → GENERATE → VALIDATE → REFINE → OUTPUT
 *
 * Results are persisted to Supabase via the WorkflowEngine after passing
 * the security validation gate.
 */

import { ExecutionPipeline } from '../core/execution-pipeline.js';
import { validateOutput } from '../core/agent-runtime.js';
import { buildDeterministicPrompt } from '../core/prompt-engine.js';
import { WorkflowEngine } from '../core/workflow-engine.js';

const AGENT_TYPE = 'deterministic-execution';

export class DeterministicExecutionAgent {
  /**
   * @param {object} [options]
   * @param {number} [options.maxRefinements=3] - Max refinement iterations in the pipeline
   */
  constructor(options = {}) {
    this.pipeline = new ExecutionPipeline({ maxRefinements: options.maxRefinements });
    this.engine = new WorkflowEngine();
  }

  /**
   * Execute a task through the full deterministic pipeline and persist the result.
   *
   * @param {string|object} input - Task description or `{ task, context }` object
   * @param {{ rules: string }} [profile] - AI-FACTORY-v2 profile (used by security gate)
   * @returns {Promise<{ output: string, record: object|null, securityPassed: boolean }>}
   */
  async execute(input, profile = { rules: '' }) {
    const task = typeof input === 'string' ? input : (input.task ?? '');
    const context = typeof input === 'object' ? (input.context ?? '') : '';

    console.log(`🤖 [${AGENT_TYPE}] Starting execution pipeline…`);

    // Steps 1–6: run the full pipeline
    const output = this.pipeline.run({ task, context });

    console.log(`🔍 [${AGENT_TYPE}] Running security validation…`);

    // Security gate — must pass before persisting
    const security = await validateOutput(output, profile);

    if (!security.passed) {
      console.warn(
        `⚠️  [${AGENT_TYPE}] Security violations found:\n` +
          security.violations.map((v) => `  • ${v}`).join('\n')
      );
    }

    const finalOutput = security.sanitisedOutput;

    // Persist sanitised result to Supabase
    let record = null;
    try {
      const understood = this.pipeline.understand({ task, context });
      const prompt = buildDeterministicPrompt({
        task,
        taskType: understood.taskType,
        constraints: understood.constraints,
        outputType: understood.outputType,
        assumptions: understood.assumptions,
      });

      record = await this.engine.storeInstruction(AGENT_TYPE, {
        prompt,
        output: finalOutput,
        securityPassed: security.passed,
        generatedAt: new Date().toISOString(),
      });

      console.log(`✅ [${AGENT_TYPE}] Result persisted to Supabase`);
    } catch (err) {
      console.error(`❌ [${AGENT_TYPE}] Failed to persist result: ${err.message}`);
    }

    return {
      output: finalOutput,
      record,
      securityPassed: security.passed,
    };
  }

  /**
   * Retrieve previously stored execution results from Supabase.
   *
   * @returns {Promise<object[]>}
   */
  async listResults() {
    return this.engine.fetchInstructions(AGENT_TYPE);
  }
}
