/**
 * Execution Pipeline
 *
 * Implements the Deterministic AI Execution Agent pipeline:
 *   1. UNDERSTAND  — extract objective, constraints, assumptions, output type
 *   2. STRUCTURE   — define subtasks, execution steps, output schema / format
 *   3. GENERATE    — produce the artefact from the structured plan
 *   4. VALIDATE    — completeness, consistency, structure, actionability checks
 *   5. REFINE      — fix weaknesses (max `maxRefinements` iterations)
 *   6. OUTPUT      — wrap in the standard result envelope
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PIPELINE_STEPS = [
  'UNDERSTAND',
  'STRUCTURE',
  'GENERATE',
  'VALIDATE',
  'REFINE',
  'OUTPUT',
];

/** Task-type classifications used by specialisation mode. */
export const TASK_TYPES = {
  CODE: 'CODE',
  DATA: 'DATA',
  BUSINESS: 'BUSINESS',
  GENERIC: 'GENERIC',
};

// ---------------------------------------------------------------------------
// ExecutionPipeline
// ---------------------------------------------------------------------------

export class ExecutionPipeline {
  /**
   * @param {object} [options]
   * @param {number} [options.maxRefinements=3] - Maximum refinement iterations
   */
  constructor(options = {}) {
    this.maxRefinements = options.maxRefinements ?? 3;
  }

  // ---- Step 1: UNDERSTAND -------------------------------------------------

  /**
   * Parse raw input and return a structured understanding object.
   *
   * @param {string|object} input - Raw task description or structured input
   * @returns {{ objective: string, taskType: string, constraints: string[], outputType: string, assumptions: string[], missingInfo: string[] }}
   */
  understand(input) {
    const task = typeof input === 'string' ? input : (input.task ?? JSON.stringify(input));
    const context = typeof input === 'object' ? (input.context ?? '') : '';

    const taskType = _detectTaskType(task);
    const constraints = _extractConstraints(task, context);
    const outputType = _inferOutputType(task, taskType);
    const missingInfo = _findMissingInfo(task);

    const assumptions = [];
    if (missingInfo.length > 0) {
      assumptions.push(
        ...missingInfo.map((m) => `Assuming default value for missing: ${m}`)
      );
    }
    if (!context) {
      assumptions.push('No additional context provided — analysis based on task description only');
    }

    return {
      objective: task.trim(),
      taskType,
      constraints,
      outputType,
      assumptions,
      missingInfo,
    };
  }

  // ---- Step 2: STRUCTURE --------------------------------------------------

  /**
   * Convert the understanding into an execution plan with a defined schema.
   *
   * @param {{ objective: string, taskType: string, constraints: string[], outputType: string }} understood
   * @returns {{ subtasks: string[], executionSteps: string[], outputSchema: object, format: string }}
   */
  structure(understood) {
    const { objective, taskType, outputType } = understood;

    const subtasks = _buildSubtasks(taskType, objective);
    const executionSteps = _buildExecutionSteps(taskType, subtasks);
    const outputSchema = _buildOutputSchema(taskType, outputType);
    const format = outputType;

    return { subtasks, executionSteps, outputSchema, format };
  }

  // ---- Step 3: GENERATE ---------------------------------------------------

  /**
   * Produce the agent output from the structured plan.
   *
   * @param {{ subtasks: string[], executionSteps: string[], outputSchema: object, format: string }} structured
   * @param {{ objective: string, taskType: string, constraints: string[] }} understood
   * @returns {string}
   */
  generate(structured, understood) {
    const { subtasks, executionSteps, outputSchema, format } = structured;
    const { objective, taskType, constraints } = understood;

    const lines = [
      `# Execution Plan: ${_titleCase(taskType)} Task`,
      '',
      `**Objective:** ${objective}`,
      '',
    ];

    if (constraints.length > 0) {
      lines.push('## Constraints', '');
      constraints.forEach((c) => lines.push(`- ${c}`));
      lines.push('');
    }

    lines.push('## Subtasks', '');
    subtasks.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    lines.push('');

    lines.push('## Execution Steps', '');
    executionSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    lines.push('');

    lines.push('## Output Schema', '');
    lines.push('```json', JSON.stringify(outputSchema, null, 2), '```', '');

    lines.push(`## Output Format`, '', `\`${format}\``);

    return lines.join('\n');
  }

  // ---- Step 4: VALIDATE ---------------------------------------------------

  /**
   * Run the four validation gates against a generated output.
   *
   * @param {string} output
   * @param {{ subtasks: string[], executionSteps: string[], outputSchema: object }} structured
   * @returns {{ passed: boolean, completeness: boolean, consistency: boolean, structure: boolean, actionability: boolean, failures: string[] }}
   */
  validate(output, structured) {
    const failures = [];

    // A. Completeness — required sections present
    const requiredSections = ['Objective', 'Subtasks', 'Execution Steps', 'Output Schema'];
    for (const section of requiredSections) {
      if (!output.includes(section)) {
        failures.push(`COMPLETENESS: Missing required section "${section}"`);
      }
    }

    // B. Consistency — no contradictions (empty output vs listed subtasks)
    if (structured.subtasks.length > 0 && !output.includes('1.')) {
      failures.push('CONSISTENCY: Subtasks listed but not enumerated in output');
    }

    // C. Structure — output is non-empty and has a title
    if (!output.trim()) {
      failures.push('STRUCTURE: Output is empty');
    }
    if (!output.startsWith('#')) {
      failures.push('STRUCTURE: Output does not begin with a Markdown heading');
    }

    // D. Actionability — no placeholder text
    const placeholders = ['TODO', 'PLACEHOLDER', '<fill in>', 'TBD'];
    for (const p of placeholders) {
      if (output.includes(p)) {
        failures.push(`ACTIONABILITY: Placeholder text found: "${p}"`);
      }
    }

    const completeness = !failures.some((f) => f.startsWith('COMPLETENESS'));
    const consistency = !failures.some((f) => f.startsWith('CONSISTENCY'));
    const structure = !failures.some((f) => f.startsWith('STRUCTURE'));
    const actionability = !failures.some((f) => f.startsWith('ACTIONABILITY'));

    return {
      passed: failures.length === 0,
      completeness,
      consistency,
      structure,
      actionability,
      failures,
    };
  }

  // ---- Step 5: REFINE -----------------------------------------------------

  /**
   * Address validation failures and return an improved output.
   *
   * @param {string} output
   * @param {string[]} failures
   * @param {{ subtasks: string[], executionSteps: string[] }} structured
   * @returns {string}
   */
  refine(output, failures, structured) {
    let refined = output;

    for (const failure of failures) {
      if (failure.includes('Missing required section "Objective"')) {
        refined = `**Objective:** (refined)\n\n${refined}`;
      }

      if (failure.includes('Missing required section "Subtasks"')) {
        const subtaskBlock =
          '\n## Subtasks\n\n' +
          structured.subtasks.map((s, i) => `${i + 1}. ${s}`).join('\n') +
          '\n';
        refined += subtaskBlock;
      }

      if (failure.includes('Missing required section "Execution Steps"')) {
        const stepsBlock =
          '\n## Execution Steps\n\n' +
          structured.executionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n') +
          '\n';
        refined += stepsBlock;
      }

      if (failure.includes('Missing required section "Output Schema"')) {
        refined += '\n## Output Schema\n\n```json\n{}\n```\n';
      }

      if (failure.includes('Output does not begin with a Markdown heading')) {
        refined = `# Execution Plan\n\n${refined}`;
      }

      // Remove placeholder text
      for (const p of ['TODO', 'PLACEHOLDER', '<fill in>', 'TBD']) {
        refined = refined.replaceAll(p, '[resolved]');
      }
    }

    return refined;
  }

  // ---- Step 6: OUTPUT -----------------------------------------------------

  /**
   * Wrap the final result in the standard pipeline output envelope.
   *
   * @param {string} result
   * @param {string} structureUsed
   * @param {string[]} assumptions
   * @param {{ completeness: boolean, structure: boolean, actionability: boolean }} validationCheck
   * @returns {string}
   */
  formatOutput(result, structureUsed, assumptions, validationCheck) {
    const check = (v) => (v ? '✅' : '❌');

    return [
      '## RESULT',
      '',
      result,
      '',
      '## STRUCTURE USED',
      '',
      structureUsed,
      '',
      '## ASSUMPTIONS',
      '',
      assumptions.length > 0
        ? assumptions.map((a) => `- ${a}`).join('\n')
        : '- None',
      '',
      '## VALIDATION CHECK',
      '',
      `- Completeness: ${check(validationCheck.completeness)}`,
      `- Structure: ${check(validationCheck.structure)}`,
      `- Actionability: ${check(validationCheck.actionability)}`,
    ].join('\n');
  }

  // ---- Orchestrator -------------------------------------------------------

  /**
   * Run the full 6-step pipeline on a given input.
   *
   * @param {string|object} input
   * @returns {string} Standard pipeline output envelope
   */
  run(input) {
    // 1. UNDERSTAND
    const understood = this.understand(input);

    // 2. STRUCTURE
    const structured = this.structure(understood);

    // 3. GENERATE
    let generated = this.generate(structured, understood);

    // 4. VALIDATE + 5. REFINE (loop, max `maxRefinements` iterations)
    let validation = this.validate(generated, structured);
    let iterations = 0;

    while (!validation.passed && iterations < this.maxRefinements) {
      generated = this.refine(generated, validation.failures, structured);
      validation = this.validate(generated, structured);
      iterations++;
    }

    // 6. OUTPUT
    return this.formatOutput(
      generated,
      structured.format,
      understood.assumptions,
      validation
    );
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _detectTaskType(task) {
  const lower = task.toLowerCase();
  if (/\b(code|function|class|api|module|implement|build|refactor|test)\b/.test(lower)) {
    return TASK_TYPES.CODE;
  }
  if (/\b(data|schema|database|table|query|sql|model|etl|pipeline|storage)\b/.test(lower)) {
    return TASK_TYPES.DATA;
  }
  if (/\b(strategy|business|plan|kpi|metric|revenue|market|roadmap|stakeholder)\b/.test(lower)) {
    return TASK_TYPES.BUSINESS;
  }
  return TASK_TYPES.GENERIC;
}

function _extractConstraints(task, context) {
  const constraints = [];
  const src = `${task} ${context}`.toLowerCase();

  if (/no hardcoded secret|no secret|no token/.test(src)) constraints.push('No hardcoded secrets or tokens');
  if (/typescript/.test(src)) constraints.push('TypeScript required');
  if (/production/.test(src)) constraints.push('Production-ready output only');
  if (/supabase/.test(src)) constraints.push('Use shared Supabase client exclusively');
  if (/no placeholder|no todo/.test(src)) constraints.push('No placeholder text or TODO comments');
  if (/modular/.test(src)) constraints.push('Modular architecture');

  return constraints;
}

function _inferOutputType(task, taskType) {
  const lower = task.toLowerCase();
  if (/json/.test(lower)) return 'JSON';
  if (/markdown|\.md/.test(lower)) return 'Markdown';
  if (/step.by.step|instructions/.test(lower)) return 'Step-by-step instructions';
  if (taskType === TASK_TYPES.CODE) return 'Code blocks with Markdown';
  if (taskType === TASK_TYPES.DATA) return 'JSON schema with Markdown';
  return 'Markdown';
}

function _findMissingInfo(task) {
  const missing = [];
  if (task.length < 20) missing.push('task description (too brief)');
  if (!/\b(repo|project|language|framework|context)\b/i.test(task)) {
    missing.push('target repository or project context');
  }
  return missing;
}

function _buildSubtasks(taskType, objective) {
  const base = [
    `Analyse requirements from: "${_truncate(objective, 60)}"`,
    'Define acceptance criteria',
    'Identify dependencies',
    'Produce primary artefact',
    'Validate output against constraints',
  ];

  if (taskType === TASK_TYPES.CODE) {
    return [
      ...base.slice(0, 3),
      'Define file structure and module boundaries',
      'Implement core logic',
      'Add error handling and edge-case coverage',
      'Write tests',
    ];
  }
  if (taskType === TASK_TYPES.DATA) {
    return [
      ...base.slice(0, 3),
      'Define data schema and relationships',
      'Specify storage logic and indexes',
      'Document query patterns',
    ];
  }
  if (taskType === TASK_TYPES.BUSINESS) {
    return [
      ...base.slice(0, 3),
      'Define strategy and execution plan',
      'Specify success metrics',
      'Identify risks and mitigations',
    ];
  }
  return base;
}

function _buildExecutionSteps(taskType, subtasks) {
  return subtasks.map((s, i) => `Step ${i + 1}: ${s}`);
}

function _buildOutputSchema(taskType, outputType) {
  const base = { result: 'string', structureUsed: 'string', assumptions: 'string[]' };

  if (taskType === TASK_TYPES.CODE) {
    return {
      ...base,
      architecture: 'string',
      fileStructure: 'string[]',
      executionSteps: 'string[]',
    };
  }
  if (taskType === TASK_TYPES.DATA) {
    return {
      ...base,
      schema: 'object',
      relationships: 'string[]',
      storageLogic: 'string',
    };
  }
  if (taskType === TASK_TYPES.BUSINESS) {
    return {
      ...base,
      strategy: 'string',
      executionPlan: 'string[]',
      metrics: 'string[]',
    };
  }
  return { ...base, outputType };
}

function _truncate(str, max) {
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

function _titleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
