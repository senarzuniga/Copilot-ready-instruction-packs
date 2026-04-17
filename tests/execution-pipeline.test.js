import { ExecutionPipeline, PIPELINE_STEPS, TASK_TYPES } from '../core/execution-pipeline.js';

const pipeline = new ExecutionPipeline();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('PIPELINE_STEPS', () => {
  test('exports the 6 mandatory steps in order', () => {
    expect(PIPELINE_STEPS).toEqual([
      'UNDERSTAND',
      'STRUCTURE',
      'GENERATE',
      'VALIDATE',
      'REFINE',
      'OUTPUT',
    ]);
  });
});

// ---------------------------------------------------------------------------
// Step 1: UNDERSTAND
// ---------------------------------------------------------------------------

describe('ExecutionPipeline.understand()', () => {
  test('returns objective equal to trimmed input string', () => {
    const result = pipeline.understand('  Build a REST API  ');
    expect(result.objective).toBe('Build a REST API');
  });

  test('detects CODE task type from keywords', () => {
    const result = pipeline.understand('implement a TypeScript function');
    expect(result.taskType).toBe(TASK_TYPES.CODE);
  });

  test('detects DATA task type from keywords', () => {
    const result = pipeline.understand('design a database schema for users');
    expect(result.taskType).toBe(TASK_TYPES.DATA);
  });

  test('detects BUSINESS task type from keywords', () => {
    const result = pipeline.understand('create a business strategy with KPIs');
    expect(result.taskType).toBe(TASK_TYPES.BUSINESS);
  });

  test('falls back to GENERIC for unclassified input', () => {
    const result = pipeline.understand('describe the weather in Paris');
    expect(result.taskType).toBe(TASK_TYPES.GENERIC);
  });

  test('populates assumptions when task is very short', () => {
    const result = pipeline.understand('go');
    expect(result.assumptions.length).toBeGreaterThan(0);
    expect(result.assumptions.some((a) => a.includes('missing'))).toBe(true);
  });

  test('accepts object input with task and context fields', () => {
    const result = pipeline.understand({ task: 'build an API', context: 'Node.js' });
    expect(result.objective).toBe('build an API');
  });
});

// ---------------------------------------------------------------------------
// Step 2: STRUCTURE
// ---------------------------------------------------------------------------

describe('ExecutionPipeline.structure()', () => {
  test('returns subtasks, executionSteps, outputSchema, and format', () => {
    const understood = pipeline.understand('implement a modular authentication module');
    const structured = pipeline.structure(understood);

    expect(Array.isArray(structured.subtasks)).toBe(true);
    expect(structured.subtasks.length).toBeGreaterThan(0);
    expect(Array.isArray(structured.executionSteps)).toBe(true);
    expect(typeof structured.outputSchema).toBe('object');
    expect(typeof structured.format).toBe('string');
  });

  test('CODE tasks include file-structure subtask', () => {
    const understood = pipeline.understand('implement a TypeScript module');
    const structured = pipeline.structure(understood);
    const hasFileStructure = structured.subtasks.some((s) =>
      /file structure|module/i.test(s)
    );
    expect(hasFileStructure).toBe(true);
  });

  test('DATA tasks include schema subtask', () => {
    const understood = pipeline.understand('design a database schema for products');
    const structured = pipeline.structure(understood);
    const hasSchema = structured.subtasks.some((s) => /schema/i.test(s));
    expect(hasSchema).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 3: GENERATE
// ---------------------------------------------------------------------------

describe('ExecutionPipeline.generate()', () => {
  test('returns a non-empty Markdown string starting with #', () => {
    const understood = pipeline.understand('implement a REST API in Node.js');
    const structured = pipeline.structure(understood);
    const output = pipeline.generate(structured, understood);

    expect(typeof output).toBe('string');
    expect(output.trim().length).toBeGreaterThan(0);
    expect(output.startsWith('#')).toBe(true);
  });

  test('output includes Objective section', () => {
    const understood = pipeline.understand('build a search module');
    const structured = pipeline.structure(understood);
    const output = pipeline.generate(structured, understood);
    expect(output).toContain('Objective');
  });

  test('output includes Execution Steps section', () => {
    const understood = pipeline.understand('build a search module');
    const structured = pipeline.structure(understood);
    const output = pipeline.generate(structured, understood);
    expect(output).toContain('Execution Steps');
  });
});

// ---------------------------------------------------------------------------
// Step 4: VALIDATE
// ---------------------------------------------------------------------------

describe('ExecutionPipeline.validate()', () => {
  test('passes a well-formed output', () => {
    const understood = pipeline.understand('implement a caching layer in Node.js');
    const structured = pipeline.structure(understood);
    const output = pipeline.generate(structured, understood);
    const result = pipeline.validate(output, structured);

    expect(result.passed).toBe(true);
    expect(result.failures).toEqual([]);
  });

  test('fails when output is empty', () => {
    const understood = pipeline.understand('some task');
    const structured = pipeline.structure(understood);
    const result = pipeline.validate('', structured);

    expect(result.passed).toBe(false);
    expect(result.structure).toBe(false);
  });

  test('fails when output contains placeholder text', () => {
    const understood = pipeline.understand('some task');
    const structured = pipeline.structure(understood);
    const badOutput =
      '# Plan\n\n**Objective:** do something\n\n## Subtasks\n\n1. Step A\n\n## Execution Steps\n\n1. Step A\n\n## Output Schema\n\n```json\n{}\n```\n\nTODO: fill this in';
    const result = pipeline.validate(badOutput, structured);

    expect(result.passed).toBe(false);
    expect(result.actionability).toBe(false);
  });

  test('fails when Markdown heading is missing', () => {
    const understood = pipeline.understand('some task');
    const structured = pipeline.structure(understood);
    const noHeading = 'Objective: build something\n\nSubtasks\n\nExecution Steps\n\nOutput Schema';
    const result = pipeline.validate(noHeading, structured);

    expect(result.passed).toBe(false);
    expect(result.structure).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Step 5: REFINE
// ---------------------------------------------------------------------------

describe('ExecutionPipeline.refine()', () => {
  test('removes placeholder text', () => {
    const understood = pipeline.understand('build something');
    const structured = pipeline.structure(understood);
    const withPlaceholder =
      '# Plan\n\n**Objective:** do it\n\n## Subtasks\n\n1. step\n\n## Execution Steps\n\n1. step\n\n## Output Schema\n\nTODO fix this';
    const refined = pipeline.refine(withPlaceholder, ['ACTIONABILITY: Placeholder text found: "TODO"'], structured);
    expect(refined).not.toContain('TODO');
  });

  test('adds heading when missing', () => {
    const understood = pipeline.understand('build something');
    const structured = pipeline.structure(understood);
    const noHeading = 'some output without heading';
    const refined = pipeline.refine(
      noHeading,
      ['STRUCTURE: Output does not begin with a Markdown heading'],
      structured
    );
    expect(refined.startsWith('#')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 6: OUTPUT (formatOutput)
// ---------------------------------------------------------------------------

describe('ExecutionPipeline.formatOutput()', () => {
  test('returns the standard 4-section envelope', () => {
    const formatted = pipeline.formatOutput(
      'The result content',
      'Markdown',
      ['Assumption one'],
      { completeness: true, structure: true, actionability: true }
    );

    expect(formatted).toContain('## RESULT');
    expect(formatted).toContain('## STRUCTURE USED');
    expect(formatted).toContain('## ASSUMPTIONS');
    expect(formatted).toContain('## VALIDATION CHECK');
  });

  test('shows ✅ for passing checks', () => {
    const formatted = pipeline.formatOutput('result', 'Markdown', [], {
      completeness: true,
      structure: true,
      actionability: true,
    });
    expect(formatted).toContain('✅');
    expect(formatted).not.toContain('❌');
  });

  test('shows ❌ for failing checks', () => {
    const formatted = pipeline.formatOutput('result', 'Markdown', [], {
      completeness: false,
      structure: false,
      actionability: false,
    });
    expect(formatted).toContain('❌');
  });

  test('shows "None" when no assumptions provided', () => {
    const formatted = pipeline.formatOutput('result', 'Markdown', [], {
      completeness: true,
      structure: true,
      actionability: true,
    });
    expect(formatted).toContain('- None');
  });
});

// ---------------------------------------------------------------------------
// Full pipeline: run()
// ---------------------------------------------------------------------------

describe('ExecutionPipeline.run()', () => {
  test('returns the standard 4-section envelope for a CODE task', () => {
    const output = pipeline.run('implement a user authentication module in TypeScript');
    expect(output).toContain('## RESULT');
    expect(output).toContain('## STRUCTURE USED');
    expect(output).toContain('## ASSUMPTIONS');
    expect(output).toContain('## VALIDATION CHECK');
  });

  test('all validation checks pass for a well-described task', () => {
    const output = pipeline.run({
      task: 'implement a modular REST API with Express.js for a product catalog',
      context: 'Node.js, TypeScript, production environment',
    });
    expect(output).toContain('✅');
  });

  test('handles very short input without throwing', () => {
    expect(() => pipeline.run('go')).not.toThrow();
  });

  test('maxRefinements option is respected', () => {
    const singleRun = new ExecutionPipeline({ maxRefinements: 0 });
    const output = singleRun.run('implement something');
    expect(output).toContain('## RESULT');
  });
});
