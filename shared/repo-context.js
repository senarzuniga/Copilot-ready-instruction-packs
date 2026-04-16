const path = require('path');
const fs = require('fs');

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

module.exports = { getRepoRoot, getRepoContext };
