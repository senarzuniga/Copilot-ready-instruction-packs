#!/usr/bin/env python3
"""
launcher.py — AI Copilot Instruction Factory entry point.

Loads environment, validates prerequisites, and delegates
to the Node.js workflow engine.
"""

import os
import sys
import subprocess
from pathlib import Path


def load_env() -> None:
    """Load .env.local into the process environment."""
    try:
        from dotenv import load_dotenv
        env_path = Path(__file__).parent.parent / ".env.local"
        if env_path.exists():
            load_dotenv(env_path)
            print(f"✅ Environment loaded from {env_path}")
        else:
            print("⚠️  .env.local not found — relying on shell environment variables")
    except ImportError:
        print("⚠️  python-dotenv not installed — relying on shell environment variables")


def check_prerequisites() -> None:
    """Raise if required environment variables are absent."""
    required = ["SUPABASE_URL", "SUPABASE_ANON_KEY"]
    missing = [v for v in required if not os.environ.get(v)]
    if missing:
        print(
            f"❌ Missing required environment variables: {', '.join(missing)}\n"
            "   Set them in .env.local or your shell before running."
        )
        sys.exit(1)


def run_workflow(task: str, repo: str) -> None:
    """Invoke the Node.js workflow engine."""
    root = Path(__file__).parent.parent

    env = os.environ.copy()
    env["WORKFLOW_TASK"] = task
    env["WORKFLOW_REPO"] = repo

    result = subprocess.run(
        ["node", str(root / "core" / "workflow-engine.js")],
        cwd=str(root),
        env=env,
    )

    if result.returncode != 0:
        print(f"❌ Workflow engine exited with code {result.returncode}")
        sys.exit(result.returncode)


if __name__ == "__main__":
    load_env()

    print("🚀 AI Copilot Instruction Factory starting...")

    check_prerequisites()

    run_workflow(
        task="generate_copilot_instructions",
        repo=os.getcwd(),
    )
