---
name: local-smoke
description: Use this skill when asked to prove that a locally-sourced (non-repo) niceeval Skill fixture was installed and is readable inside the sandbox. It exists purely as an e2e fixture with a unique marker string, not as real guidance.
---

# Local Skill Smoke Fixture

This file only exists to prove that `{ kind: "local", path: "..." }` Skill
installation actually copies real bytes into the sandbox at
`.claude/skills/local-smoke/SKILL.md`, and that the resulting
`agent-setup.json` manifest entry hashes those same bytes.

Unique marker: niceeval-local-skill-smoke-v1
