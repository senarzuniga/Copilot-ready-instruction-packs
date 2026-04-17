import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function getRepoRoot() {
  return path.resolve(__dirname, '..');
}

function getRepoContext() {
  const root = getRepoRoot();
  return {
    root,
    agents: path.join(root, 'agents'),
    core: path.join(root, 'core'),
    supabase: path.join(root, 'supabase'),
    launcher: path.join(root, 'launcher'),
    scripts: path.join(root, 'scripts'),
    shared: path.join(root, 'shared'),
  };
}

export { getRepoRoot, getRepoContext };
