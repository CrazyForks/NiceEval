---
name: docs-reference
description: Check or regenerate NiceEval public API reference regions from their source owners.
metadata:
  command: pnpm run repo docs reference
  design: docs/README.md
---

# Documentation reference generation

Read the [documentation synchronization rules](../../../docs/README.md#同步义务) and the affected docs-site owner instructions. Run `pnpm run repo docs reference --help` for current syntax.

Run with `--dry-run` before generating. Both Chinese and English GENERATED regions share source-owned headings, signatures, types, defaults, and order. Edit source TSDoc or option help for Chinese descriptions; edit `apps/docs-site/reference/.generated-en.json` for English descriptions. Never patch generated regions as a shortcut.

Translation keys use `region/member`, `region/group/member` for grouped members, and `cli-flags/sorted,commands/--flag` for CLI rows. Keep an entry even for an undocumented member (an empty string is allowed only when its source description is empty). Shared-name union variants share one description. Missing keys, empty translations of documented entries, and keys no longer present in source fail generation and `--dry-run` before any output is written. When renaming or removing a source entry, update its translation key in the same change. See the [reference contract](../../../docs/engineering/repository-tools/README.md#双语-reference-生成).

The package-owned bundled index is generated separately by `pnpm build:index`. After generation, inspect the exact generated diff, rerun `--dry-run` for an empty changed-path list, and run `pnpm lint`; its reference drift check covers both languages and validates the translation catalog.
