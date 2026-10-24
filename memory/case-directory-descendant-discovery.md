---
format: concord.document/v1
id: case-directory-descendant-discovery
title: Case 目录中的嵌套仓库被当作宿主评估用例发现
createdAt: 2026-10-24
kind: memory
memoryKind: problem
state: open
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history: []
---
# Case 目录中的嵌套仓库被当作宿主评估用例发现

GitHub #280。契约见 docs/feature/eval/README.md：含 eval.ts 的 case 目录拥有子目录资产，发现器停止扫描其子目录；普通 .eval.ts 旁的子目录仍参与发现。

## 复现与根因

在 case/eval.ts 旁放入 repo/nested.eval.ts、repo/nested.eval.tsx、repo/eval.ts 与 repo/eval-group.ts。安装后旧候选经 exp --dry --json 校验或导入这些资产，报重复 ID 或执行资产顶层代码。walkFiles 对所有子目录递归，Eval Group 扫描也没有 case 边界。

## 修正与验证

Eval 与 Eval Group 扫描共享目录入口判定，在文件夹入口处停止递归。Experiment 扫描保持原规则。公开 CLI owner 为 e2e/cli/test/case-discovery.test.ts，以会抛错的嵌套资产和三个明确计划 ID 区分错误实现。

旧候选 commit 为 4f59fcb18c560404dcdf93319196d11df3a2ce0c，tarball SHA-256 为 44bed3100b526c04c87df3d1f66ae70906673b2bc72b7e115715a92e14763663。正式 red 为 nered_8B5RDE84X9HBBXCD，绑定本 Problem epoch 0；最早失败为 discovery.duplicate-id。原生库存 neinv_R5FHSEV17HTJHR1D，selector 为 e2e/cli/test/case-discovery.test.ts#neref_108929a15afaf1e96f5d728afb50ba14。

修复候选 SHA-256 为 aadb54efac8fd21301cd2951fec4e28d74a5c9e7f1f2bc65e3fec486808e30b0，公开单项 E2E 转绿并完成资源清理。pnpm typecheck、pnpm lint 与 pnpm test（146 项）通过。完整 takeover 与 regression 关系尚未建立，Problem 保持 open：并行任务修改了 CLI Repo 的其它 owner，新断言依赖尚未进入上述固定候选的诊断修复，需要集成候选完成默认并行轮与其余可靠性门。
