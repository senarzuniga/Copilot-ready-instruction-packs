/**
 * Supabase Sync
 *
 * TypeScript helper that links the local project to Supabase and
 * distributes the shared .env.local to sub-packages.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Link the Supabase project using the project ref from the environment.
 * Reads SUPABASE_PROJECT_ID — no tokens passed as arguments.
 */
export function linkProject(): void {
  const projectId = process.env.SUPABASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("SUPABASE_PROJECT_ID is not set.");
  }

  console.log(`🔗 Linking Supabase project: ${projectId}`);
  execSync(`supabase link --project-ref ${projectId}`, { stdio: "inherit" });
}

/**
 * Copy .env.local to all application sub-directories that declare a
 * package.json (so they share the same environment).
 *
 * @param rootDir - Repository root (defaults to process.cwd())
 */
export function syncEnvLocal(rootDir = process.cwd()): void {
  const source = path.join(rootDir, ".env.local");

  if (!fs.existsSync(source)) {
    console.warn("⚠️  .env.local not found — skipping sync");
    return;
  }

  const content = fs.readFileSync(source, "utf8");

  const appDirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        !d.name.startsWith(".") &&
        fs.existsSync(path.join(rootDir, d.name, "package.json"))
    )
    .map((d) => path.join(rootDir, d.name));

  for (const dir of appDirs) {
    const dest = path.join(dir, ".env.local");
    fs.writeFileSync(dest, content, "utf8");
    console.log(`  ✅ Synced .env.local → ${dir}`);
  }

  console.log(`🔄 .env.local synced to ${appDirs.length} sub-package(s)`);
}
