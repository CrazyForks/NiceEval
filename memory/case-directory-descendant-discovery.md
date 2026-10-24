---
format: concord.document/v1
id: case-directory-descendant-discovery
title: Case 目录中的嵌套仓库被当作宿主评估用例发现
createdAt: 2026-10-24
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-24T07:03:04.056Z
    action: resolve
    reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
    resolution:
      kind: fixed
      reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
      at: 2026-10-24T07:03:04.056Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/case-directory-descendant-discovery.md
        epoch: 0
        validatedAt: 2026-10-24T07:02:45.153Z
        cases:
          - selector: e2e/cli/test/case-discovery.test.ts#neref_108929a15afaf1e96f5d728afb50ba14
            caseId: neref_108929a15afaf1e96f5d728afb50ba14
            binding:
              kind: direct-contract
              contractRef: docs/feature/eval/README.md
              contractSha256: 233be3a692695cb179a0a22b5b9f382909a76ef6dc090c0d084a0cea33badb2d
            sourceDigest: sha256:c64d6a4d3ce91931ff4fbd942e69e9a167a2fdc2746755e1dee6f45ee99122f7
            candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
            sourceIdentityDigest: 0349c285d21306d9cd4c605e2d6956dafec6f253ef2b2caafef1223b81381b88
            red:
              path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/red.json
              digest: sha256:884d58cb7a2de1ccf577a792514ea28ca1ae77a7e005b5d926c9289c9755f471
            green:
              path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/green.json
              digest: sha256:b338da8b5797d4bcdae0fa550667dd3dbd28f69d7d7338bb254e2c7016d79978
            certificate:
              path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/certificate.json
              digest: sha256:483a37f414e0ae2af603d9ed111b3287aa860528266b0696c811dcdcff816886
            inventory:
              path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/inventory.json
              digest: sha256:ad82e46de37068e89f93e837d1e4e49516e58db79522b1195c15bb4dd8b63975
            reliability:
              - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-1.json
                digest: sha256:ee82387e994a56736c9d9cd21d22ce08501efacdf7ce68174c080273758f47d5
              - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-2.json
                digest: sha256:9672f23703c249a10c28d7cb1858a3564ca3c4e3cbc107fec791ab768e0f024f
              - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-3.json
                digest: sha256:20e4feeadc47323905b3d446e13d193cb3e4eb5287446b96ed120116fc7c6a49
              - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-4.json
                digest: sha256:6ca9717313d51952489d08df720e24e265344cfdd11781a343d967bc63a4c239
              - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-5.json
                digest: sha256:6f38c6ce5bf294df82e8248a7e639e483819059a65f449264579a15454b62451
              - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-6.json
                digest: sha256:85d607b6cf26af1baebcfa81439c0ed163aae471da5c1a8464d3fe44e5291ac3
            invocationIds:
              - 91245e11-27a5-44ae-b153-eacf6b44fa06
              - 79096a32-3efe-4e6b-b0b7-e30450541fc2
              - 8168fa62-38f6-41bb-9f82-cbf748e60fd2
              - 3d21ab53-5611-4dce-b273-9212c99e99c8
              - c4fdcd0b-b321-4fcb-ac8d-0064ce7c6f88
              - cedc6021-0123-4d36-a4fc-31201a0c8902
              - 5861c97d-dc69-47ef-be94-695ca725ef54
              - 4622a3bb-ab85-4873-a366-8ec4e9eac97e
    commit: b1875255ef08f881816b2ddda3a48d5a0d278701
resolution:
  kind: fixed
  reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
  at: 2026-10-24T07:03:04.056Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/case-directory-descendant-discovery.md
    epoch: 0
    validatedAt: 2026-10-24T07:02:45.153Z
    cases:
      - selector: e2e/cli/test/case-discovery.test.ts#neref_108929a15afaf1e96f5d728afb50ba14
        caseId: neref_108929a15afaf1e96f5d728afb50ba14
        binding:
          kind: direct-contract
          contractRef: docs/feature/eval/README.md
          contractSha256: 233be3a692695cb179a0a22b5b9f382909a76ef6dc090c0d084a0cea33badb2d
        sourceDigest: sha256:c64d6a4d3ce91931ff4fbd942e69e9a167a2fdc2746755e1dee6f45ee99122f7
        candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
        sourceIdentityDigest: 0349c285d21306d9cd4c605e2d6956dafec6f253ef2b2caafef1223b81381b88
        red:
          path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/red.json
          digest: sha256:884d58cb7a2de1ccf577a792514ea28ca1ae77a7e005b5d926c9289c9755f471
        green:
          path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/green.json
          digest: sha256:b338da8b5797d4bcdae0fa550667dd3dbd28f69d7d7338bb254e2c7016d79978
        certificate:
          path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/certificate.json
          digest: sha256:483a37f414e0ae2af603d9ed111b3287aa860528266b0696c811dcdcff816886
        inventory:
          path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/inventory.json
          digest: sha256:ad82e46de37068e89f93e837d1e4e49516e58db79522b1195c15bb4dd8b63975
        reliability:
          - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-1.json
            digest: sha256:ee82387e994a56736c9d9cd21d22ce08501efacdf7ce68174c080273758f47d5
          - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-2.json
            digest: sha256:9672f23703c249a10c28d7cb1858a3564ca3c4e3cbc107fec791ab768e0f024f
          - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-3.json
            digest: sha256:20e4feeadc47323905b3d446e13d193cb3e4eb5287446b96ed120116fc7c6a49
          - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-4.json
            digest: sha256:6ca9717313d51952489d08df720e24e265344cfdd11781a343d967bc63a4c239
          - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-5.json
            digest: sha256:6f38c6ce5bf294df82e8248a7e639e483819059a65f449264579a15454b62451
          - path: e2e/cli/test/case-discovery.test.ts.case-evidence/neref_108929a15afaf1e96f5d728afb50ba14/memory_case-directory-descendant-discovery.md/nered_47SG8S9M82J7CPJ0-netake_01MMD3FQFAKZ4ECZ/reliability-6.json
            digest: sha256:85d607b6cf26af1baebcfa81439c0ed163aae471da5c1a8464d3fe44e5291ac3
        invocationIds:
          - 91245e11-27a5-44ae-b153-eacf6b44fa06
          - 79096a32-3efe-4e6b-b0b7-e30450541fc2
          - 8168fa62-38f6-41bb-9f82-cbf748e60fd2
          - 3d21ab53-5611-4dce-b273-9212c99e99c8
          - c4fdcd0b-b321-4fcb-ac8d-0064ce7c6f88
          - cedc6021-0123-4d36-a4fc-31201a0c8902
          - 5861c97d-dc69-47ef-be94-695ca725ef54
          - 4622a3bb-ab85-4873-a366-8ec4e9eac97e
---
# Case 目录中的嵌套仓库被当作宿主评估用例发现

GitHub #280。契约见 docs/feature/eval/README.md：含 eval.ts 的 case 目录拥有子目录资产，发现器停止扫描其子目录；普通 .eval.ts 旁的子目录仍参与发现。

## 复现与根因

在 case/eval.ts 旁放入 repo/nested.eval.ts、repo/nested.eval.tsx、repo/eval.ts 与 repo/eval-group.ts。安装后旧候选经 exp --dry --json 校验或导入这些资产，报重复 ID 或执行资产顶层代码。walkFiles 对所有子目录递归，Eval Group 扫描也没有 case 边界。

## 修正与验证

Eval 与 Eval Group 扫描共享目录入口判定，在文件夹入口处停止递归。Experiment 扫描保持原规则。公开 CLI owner 为 e2e/cli/test/case-discovery.test.ts，以会抛错的嵌套资产和三个明确计划 ID 区分错误实现。

旧候选 commit 为 4f59fcb18c560404dcdf93319196d11df3a2ce0c，tarball SHA-256 为 44bed3100b526c04c87df3d1f66ae70906673b2bc72b7e115715a92e14763663。正式 red 为 nered_8B5RDE84X9HBBXCD，绑定本 Problem epoch 0；最早失败为 discovery.duplicate-id。原生库存 neinv_R5FHSEV17HTJHR1D，selector 为 e2e/cli/test/case-discovery.test.ts#neref_108929a15afaf1e96f5d728afb50ba14。

修复候选 SHA-256 为 aadb54efac8fd21301cd2951fec4e28d74a5c9e7f1f2bc65e3fec486808e30b0，公开单项 E2E 转绿并完成资源清理。pnpm typecheck、pnpm lint 与 pnpm test（146 项）通过。

## 集成验收

集成候选 SHA-256 为 `51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9`。当前测试 owner 的正式 red、green 与完整 takeover 已由受管命令验证并绑定；takeover 包含独立副本、同目录重复、项目默认并行、清理后重跑及资源清理。

- `e2e/cli/test/case-discovery.test.ts#neref_108929a15afaf1e96f5d728afb50ba14`：inventory `neinv_W9T6CED8A8DMTRN2`，red `nered_47SG8S9M82J7CPJ0`，takeover `netake_01MMD3FQFAKZ4ECZ`。

上述刷新 red 使用明确重建的回归候选，不能解释为原历史版本：在最终候选的源码上只恢复相关旧行为，并保留新版公开诊断解码器，以便当前安装后测试能够收集。原历史 red 仍保留在上文。通用重建候选 SHA-256 为 `e4d0756d79c75b4322746909fb345d3785c08b2bb56c3a3ca6289273a01855a6`，源码基点为 `9e02c7304416c93863c88a4dff69d20450e74370`；测试由正式 runner 安装 tarball 后通过公开入口执行，不把 collection 错误计为产品红灯。重建后逐文件核对恢复摘要并重建发布运行时。

本轮 `pnpm typecheck`、`pnpm test`（146 项）和 `pnpm lint` 通过。未运行真实 Incus/OpenSandbox 服务验收，未清理真实 `/data` 缓存；协议故障端与隔离 Docker 运行结果不代表这些服务的生产验收。
