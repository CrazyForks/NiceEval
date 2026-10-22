---
name: docs-terminology
description: Maintain NiceEval concepts and documentation writing policies through Concord, and diagnose terminology or readability findings.
metadata:
  command: pnpm exec concord writing
  design: docs/engineering/repository-tools/README.md
---

# Documentation terminology

Read the [writing rules](../../../docs/README.md#写给人读), then run `pnpm exec concord --skill document` and read the installed package's `docs/feature/documentation-quality/policy.md`.

Use `pnpm exec concord writing --help` and `pnpm exec concord concepts --help` for command syntax. Concord owns the structured catalog and policy; Markdown explains relationships and examples without a second term table.

- Run `pnpm exec concord concepts index --json` and `pnpm exec concord writing index --json` to discover owners and scopes.
- Read an owner with `concepts show --path <path> --json` or `writing show --path <path> --json` and retain its latest digest.
- Prepare the complete reviewed JSON in a temporary file. Use `concepts set` or `writing set` with `--body`, `--path`, and `--expected-digest`; inspect `--dry-run` first, then publish the same change. Only a missing owner uses `null`.
- Run `pnpm exec concord docs check --json`, inspect each finding in context, then run `pnpm lint`.

Global concepts live in `docs/concepts.json` with stable IDs, sourced definitions, and language-specific preferred names. Aliases remain allowed; deprecated names produce unconditional derived bans. Catalog names cannot carry path exemptions. Put scoped deprecation rules in the writing policy with the concept reference in `why`, and remove their unconditional catalog duplicate. Preserve the distinction between adopted Feature terms and Roadmap candidates in the definition and source link.

Global writing policy lives in `docs/concord-writing.json`. Preserve the scan roots and each ban's roots, exemptions and allowed phrases. Design-only bans use `docs`; site-only bans use `apps/docs-site/zh`; shared bans list both. Sentence and paragraph limits apply to both roots. Issue observations are exempt from all bans and use a local policy with null length limits; Issue schema validation remains with Concord Issue/check. Only the 0.19 deprecations exempt design/research/memory archives; retain the scopes of earlier bans. Use exact lifecycle and slot phrases, not bare setup, teardown or Slot. Each authored ban requires a concrete replacement and reason.

Use scoped `concepts.json` or `concord-writing.json` only when a directory owns a separate decision. Local roots cannot escape that directory. Removing a referenced concept requires resolving its imports first.

Do not mechanically replace every finding. API identifiers and historical spellings quoted as inline code are distinct from prose; inspect the owning contract before changing either. NiceEval's API-example and SVG checks remain under `lint/docs/` and read the same Concord terminology decisions where applicable.
