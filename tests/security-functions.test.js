import { validateOutput } from '../core/agent-runtime';

// Mock data for testing
const mockOutput = `
  eval('console.log(1)');
  const func = new Function('return 2');
  fetch('http://example.com');
`;

const mockProfile = { rules: '' };

describe('Security Validator', () => {
  test('should detect and sanitize insecure patterns', async () => {
    const result = await validateOutput(mockOutput, mockProfile);
    expect(result.passed).toBe(false);
    expect(result.violations).toEqual([
      '[eval() usage detected]',
      '[new Function() usage detected]',
      '[Non-TLS HTTP endpoint detected]'
    ]);
    expect(result.sanitisedOutput).not.toContain('eval');
    expect(result.sanitisedOutput).not.toContain('new Function');
    expect(result.sanitisedOutput).not.toContain('http://example.com');
  });

  test('should pass with no insecure patterns', async () => {
    const safeOutput = 'console.log("Hello, world!");';
    const result = await validateOutput(safeOutput, mockProfile);
    expect(result.passed).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.sanitisedOutput).toBe(safeOutput);
  });

  test('should handle empty output', async () => {
    const result = await validateOutput('', mockProfile);
    expect(result.passed).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.sanitisedOutput).toBe('');
  });
});
