---
format: concord.document/v1
id: e2e-nested-suite-regression-repo-id-mismatch
title: 嵌套 E2E suite 无法登记 regression：runner 回执写 manifest id，Concord 按 suite id 校验
createdAt: 2026-10-29
kind: memory
memoryKind: problem
state: open
epoch: 0
promotions: []
history: []
evidenceRequirement: concord.native-reliability/v1
---
## 现象

对 `e2e/adapter/codex-cli` 的用例执行

```sh
concord repo docs test regression add 'e2e/adapter/codex-cli/test/codex-cli.test.ts#neref_199286d0ccc42d91e90b05585572a138' \
  --memory memory/codex-app-server-usage-takes-only-last-response.md \
  --red nered_1CDK0TW362Z0KYFS --takeover netake_JGT6YPX83TTSFGB2 --inventory neinv_J383DQRENQVS0B9J
```

返回 `NativeEvidenceInvalid: Inventory suite or source policy does not match the current configured suite`。red 与 takeover 都已成功（2026-10-29，候选 `d92deb892`）。

## 根因

- `concord.repository.json` 把嵌套目录登记为短横线 suite id，例如 `{ "id": "adapter-codex-cli", "root": "e2e/adapter/codex-cli" }`；`concord repo docs test inventory --repo` 也只接受这种 id。
- e2e runner 的回执用 E2E manifest id（`packages/e2e-runner/src/workspace-inventory.ts` 的 `repo.manifest.id`，即 `adapter/codex-cli`）；`pnpm e2e evidence red` / `takeover` 的 `--repo` 也必须传这个值，否则报 `inventory repo does not match takeover repo`。
- Concord `src/evidence-policy.ts` 的 `validateNativeEvidence` 要求 `inventory.repo === currentSource.binding.suiteId`。一级目录 suite 两种写法相同（`eval`、`runner`），嵌套 suite 永远不等。

佐证：`e2e/adapter/*` 现有的 `@regression` 注释都来自 4 周前的迁移提交 `8954bf3f1`，此后嵌套 suite 没有再登记成功过。

## 影响

所有 `adapter/*` 场景的 bug 修复都无法完成 regression 登记，对应 Problem 也就无法按 fixed 正式关闭。

## 修复方向（未定）

让 runner 回执与 Concord suite 使用同一个 id：要么 runner 从 `concord.repository.json` 按 root 解析 suite id，要么 suite id 改用路径形式（需确认 Concord 是否允许 `/`）。这涉及 Concord 治理契约，需要与 Concord 侧一起定。
