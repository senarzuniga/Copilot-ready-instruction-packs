#!/usr/bin/env python3
"""
Launcher script for Copilot-ready Instruction Packs.
Starts the workflow engine and agents via Node.js.
"""

import subprocess
import sys
import os


def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("Starting Copilot-ready Instruction Packs...")

    result = subprocess.run(
        ["node", "-e", "require('./agents/copilot-instruction-agent')"],
        cwd=repo_root,
    )
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
