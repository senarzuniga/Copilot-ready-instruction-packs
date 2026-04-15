/**
 * Agent Runtime
 *
 * Low-level helpers used by the workflow engine to:
 *   - analyse a repository (repo-analyzer-agent logic)
 *   - validate agent output (security-agent logic)
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Repo Analyzer
// ---------------------------------------------------------------------------

const SECRET_PATTERNS = [
  /(?:password|passwd|secret|token|api_key|apikey)\s*=\s*["'][^"']{6,}["']/gi,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
];

/**
 * Inspects a repository directory and returns a structured context object.
 *
 * @param {string} repoPath - Absolute path to the repository root
 * @returns {Promise<import('./types.js').RepoAnalysis>}
 */
export async function analyzeRepo(repoPath) {
  const analysis = {
    language: "unknown",
    framework: "unknown",
    packageManager: "unknown",
    hasTests: false,
    hasCICD: false,
    entryPoints: [],
    dependencies: [],
    securityFlags: [],
  };

  if (!fs.existsSync(repoPath)) {
    console.warn(`⚠️  Repo path not found: ${repoPath} — skipping analysis`);
    return analysis;
  }

  // Detect package manager & framework
  const pkgJsonPath = path.join(repoPath, "package.json");
  if (fs.existsSync(pkgJsonPath)) {
    analysis.packageManager = "npm";
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };
      analysis.dependencies = Object.keys(allDeps);

      if (allDeps["next"]) analysis.framework = "Next.js";
      else if (allDeps["react"]) analysis.framework = "React";
      else if (allDeps["vue"]) analysis.framework = "Vue";
      else if (allDeps["express"]) analysis.framework = "Express";
      else if (allDeps["fastify"]) analysis.framework = "Fastify";
    } catch {
      console.warn("⚠️  Could not parse package.json");
    }
  }

  // Detect primary language
  const extensions = _countExtensions(repoPath);
  if (extensions[".ts"] || extensions[".tsx"]) analysis.language = "TypeScript";
  else if (extensions[".js"] || extensions[".jsx"]) analysis.language = "JavaScript";
  else if (extensions[".py"]) analysis.language = "Python";
  else if (extensions[".go"]) analysis.language = "Go";

  // Tests
  analysis.hasTests =
    fs.existsSync(path.join(repoPath, "__tests__")) ||
    fs.existsSync(path.join(repoPath, "tests")) ||
    fs.existsSync(path.join(repoPath, "spec")) ||
    _hasGlob(repoPath, /\.(test|spec)\.[jt]sx?$/);

  // CI/CD
  analysis.hasCICD =
    fs.existsSync(path.join(repoPath, ".github", "workflows")) ||
    fs.existsSync(path.join(repoPath, "Jenkinsfile")) ||
    fs.existsSync(path.join(repoPath, ".gitlab-ci.yml"));

  // Security flags — scan top-level files only (shallow, non-recursive)
  try {
    const topFiles = fs
      .readdirSync(repoPath, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => path.join(repoPath, d.name));

    for (const file of topFiles) {
      const content = fs.readFileSync(file, "utf8");
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(content)) {
          analysis.securityFlags.push(
            `Possible secret in ${path.basename(file)}`
          );
          break;
        }
      }
    }
  } catch {
    // Non-fatal
  }

  return analysis;
}

// ---------------------------------------------------------------------------
// Security Validator
// ---------------------------------------------------------------------------

const INSECURE_PATTERNS = [
  { pattern: /eval\s*\(/, message: "eval() usage detected", severity: "HIGH" },
  {
    pattern: /new\s+Function\s*\(/,
    message: "new Function() usage detected",
    severity: "HIGH",
  },
  {
    pattern: /http:\/\/(?!localhost)/,
    message: "Non-TLS HTTP endpoint detected",
    severity: "MEDIUM",
  },
];

/**
 * Validates and sanitises agent output against security rules.
 *
 * @param {string} output
 * @param {{ rules: string }} _profile - Reserved for future rule extensions
 * @returns {Promise<{ passed: boolean, violations: string[], sanitisedOutput: string }>}
 */
export async function validateOutput(output, _profile) {
  const violations = [];
  let sanitised = output;

  for (const { pattern, message } of INSECURE_PATTERNS) {
    if (pattern.test(sanitised)) {
      violations.push(`[${message}]`);
      sanitised = sanitised.replace(pattern, "/* REMOVED BY SECURITY AGENT */");
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    sanitisedOutput: sanitised,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _countExtensions(dir) {
  const counts = {};
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name);
        counts[ext] = (counts[ext] ?? 0) + 1;
      }
    }
  } catch {
    // ignore unreadable dirs
  }
  return counts;
}

function _hasGlob(dir, pattern) {
  try {
    return fs.readdirSync(dir).some((f) => pattern.test(f));
  } catch {
    return false;
  }
}
