import { validateSecurityRules } from '../core/agent-runtime.js';

// ---------------------------------------------------------------------------
// Security Validation Tests
// ---------------------------------------------------------------------------

describe('validateSecurityRules', () => {
  test('allows valid security configurations', () => {
    const validConfig = {
      allow: ['read', 'write'],
      deny: ['delete']
    };
    expect(() => validateSecurityRules(validConfig)).not.toThrow();
  });

  test('throws error for invalid security configurations', () => {
    const invalidConfig = {
      allow: ['read', 'write'],
      deny: ['read'] // conflicting rules
    };
    expect(() => validateSecurityRules(invalidConfig)).toThrow('Conflicting security rules');
  });

  test('throws error when no rules are provided', () => {
    const emptyConfig = {};
    expect(() => validateSecurityRules(emptyConfig)).toThrow('No security rules defined');
  });

  test('throws error for unknown actions', () => {
    const unknownActionConfig = {
      allow: ['fly'],
      deny: []
    };
    expect(() => validateSecurityRules(unknownActionConfig)).toThrow('Unknown action: fly');
  });
});
