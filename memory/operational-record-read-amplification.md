---
format: concord.document/v1
id: operational-record-read-amplification
title: Operational Record 读取重复验证全部历史
createdAt: 2026-10-20
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-20T14:35:35.391Z
    action: resolve
    reason: 公开 CLI 读取成本 owner 已取得 epoch 0 的正式 red 与同候选完整 takeover，保留外部导入 full validation。
    resolution:
      kind: fixed
      reason: 公开 CLI 读取成本 owner 已取得 epoch 0 的正式 red 与同候选完整 takeover，保留外部导入 full validation。
      at: 2026-10-20T14:35:35.391Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/operational-record-read-amplification.md
        epoch: 0
        validatedAt: 2026-10-20T14:35:32.210Z
        cases:
          - selector: e2e/inspection/test/targeted-read-cost.test.ts#neref_8c505e2fc59c377ce4805f2f171058b2
            caseId: neref_8c505e2fc59c377ce4805f2f171058b2
            binding:
              kind: direct-contract
              contractRef: docs/feature/inspection/README.md
              contractSha256: 162064d5282f0f2a7197aeffd1c68c359a7d54de762768c73adb7fc0f89c4a09
            sourceDigest: sha256:d248d1edc22e3bfec6af131e32f420bedd9f24c2730bcc3d6cf0e8c06feae6b2
            candidateSha256: 69f2a5cf89b30f2dd2c827abdc7e41c0cd884f887bbb463dd543e0bbcb16c83f
            sourceIdentityDigest: cf34080c6bdb92dcf70cea3130b8a04a8cfd6a88ca5b73c4e5b87d5f5a53455e
            red:
              path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/red.json
              digest: sha256:e54664abea79d82c49cb6b99aad2ac995c9191938009088656d38007465580ef
            green:
              path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/green.json
              digest: sha256:f4a8f3f35371624bdd6365a45b4df678d19daaefb9a98af7cac992be359bd577
            certificate:
              path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/certificate.json
              digest: sha256:dfcc779adccd079546ee280446001ebb8bdde5ffe75660830c9bb8e0e8ec92fc
            inventory:
              path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/inventory.json
              digest: sha256:3515a2b3fe4e7834ecee3a53c7dfb9167eea05630676b1b481c4e6b8ebb40bc2
            reliability:
              - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-1.json
                digest: sha256:2428af7f6dce3d9108cd403c15c5214235438bef7b893e40209aa680c600c266
              - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-2.json
                digest: sha256:e21f7637c79ae24f4ae5964298c880c0ffa503012f91b746ee4a23113d4d2601
              - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-3.json
                digest: sha256:e24724b14bae1edfd01fad5c11b0d814c10c837aa648d8c279a93e470043c3ab
              - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-4.json
                digest: sha256:9b8c947c0bf870c4078ee5a72fa787702c713693d377d0b5e6448b1af7bff967
              - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-5.json
                digest: sha256:2998b0e7594ba73a6bdca54aafcc87e9c66daf839f5f56d95cdfeaf2b300c072
              - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-6.json
                digest: sha256:200a970cdba27f039080325613d68041c9caf3071fc8c8a5ab11e936811e735a
            invocationIds:
              - 28eb1116-1f56-428d-bc49-1e8c335a0e44
              - f0f70bcb-56c4-4a89-8716-2ba147ba65cb
              - 541e93a8-4113-4f89-944d-d68922defce5
              - a0ba5940-a3e0-4fb2-b1c5-cf4765c2c1b9
              - 979d82a2-d492-4eeb-a954-30f9e3c08c52
              - 2ef34a48-e3a1-4696-baf6-9d4fdc431398
              - 40d74ec4-428b-4b7a-8239-526a9a15d33c
              - 6dc51ab8-2fe8-4139-91fc-c82d5f3013a3
    commit: 97f06fe6f99d988847e5734b445fbeb702f6f65a
resolution:
  kind: fixed
  reason: 公开 CLI 读取成本 owner 已取得 epoch 0 的正式 red 与同候选完整 takeover，保留外部导入 full validation。
  at: 2026-10-20T14:35:35.391Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/operational-record-read-amplification.md
    epoch: 0
    validatedAt: 2026-10-20T14:35:32.210Z
    cases:
      - selector: e2e/inspection/test/targeted-read-cost.test.ts#neref_8c505e2fc59c377ce4805f2f171058b2
        caseId: neref_8c505e2fc59c377ce4805f2f171058b2
        binding:
          kind: direct-contract
          contractRef: docs/feature/inspection/README.md
          contractSha256: 162064d5282f0f2a7197aeffd1c68c359a7d54de762768c73adb7fc0f89c4a09
        sourceDigest: sha256:d248d1edc22e3bfec6af131e32f420bedd9f24c2730bcc3d6cf0e8c06feae6b2
        candidateSha256: 69f2a5cf89b30f2dd2c827abdc7e41c0cd884f887bbb463dd543e0bbcb16c83f
        sourceIdentityDigest: cf34080c6bdb92dcf70cea3130b8a04a8cfd6a88ca5b73c4e5b87d5f5a53455e
        red:
          path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/red.json
          digest: sha256:e54664abea79d82c49cb6b99aad2ac995c9191938009088656d38007465580ef
        green:
          path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/green.json
          digest: sha256:f4a8f3f35371624bdd6365a45b4df678d19daaefb9a98af7cac992be359bd577
        certificate:
          path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/certificate.json
          digest: sha256:dfcc779adccd079546ee280446001ebb8bdde5ffe75660830c9bb8e0e8ec92fc
        inventory:
          path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/inventory.json
          digest: sha256:3515a2b3fe4e7834ecee3a53c7dfb9167eea05630676b1b481c4e6b8ebb40bc2
        reliability:
          - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-1.json
            digest: sha256:2428af7f6dce3d9108cd403c15c5214235438bef7b893e40209aa680c600c266
          - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-2.json
            digest: sha256:e21f7637c79ae24f4ae5964298c880c0ffa503012f91b746ee4a23113d4d2601
          - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-3.json
            digest: sha256:e24724b14bae1edfd01fad5c11b0d814c10c837aa648d8c279a93e470043c3ab
          - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-4.json
            digest: sha256:9b8c947c0bf870c4078ee5a72fa787702c713693d377d0b5e6448b1af7bff967
          - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-5.json
            digest: sha256:2998b0e7594ba73a6bdca54aafcc87e9c66daf839f5f56d95cdfeaf2b300c072
          - path: e2e/inspection/test/targeted-read-cost.test.ts.case-evidence/neref_8c505e2fc59c377ce4805f2f171058b2/memory_operational-record-read-amplification.md/nered_4BQSGBJSERSE8AQX-netake_0W6THSK2CN7YCJDP/reliability-6.json
            digest: sha256:200a970cdba27f039080325613d68041c9caf3071fc8c8a5ab11e936811e735a
        invocationIds:
          - 28eb1116-1f56-428d-bc49-1e8c335a0e44
          - f0f70bcb-56c4-4a89-8716-2ba147ba65cb
          - 541e93a8-4113-4f89-944d-d68922defce5
          - a0ba5940-a3e0-4fb2-b1c5-cf4765c2c1b9
          - 979d82a2-d492-4eeb-a954-30f9e3c08c52
          - 2ef34a48-e3a1-4696-baf6-9d4fdc431398
          - 40d74ec4-428b-4b7a-8239-526a9a15d33c
          - 6dc51ab8-2fe8-4139-91fc-c82d5f3013a3
---
# Operational Record 读取重复验证全部历史

真实项目的 582 MB Record（11 Runs、283027 collection items）上，show 约 13.5 秒，其中重复 Seal、Content 与 collection 全量验证约占 81%。底层 reader 另做 quick_check / foreign_key_check，Inspection 预解码全部附件并重复拼装成员。

Host 自己的 project writer 已在 publication / seal 事务验证闭包。采用的边界是：operational reader 信任 Host-owned ProjectDatabase，保留精确 schema、migration readiness、legacy fail-closed 和 BEGIN pinned cutoff。实际读取 Core、Attachment 时继续严格 decode、校验摘要与关系。外部与捕获 Record、migration、seal/recovery 和完整性维护继续 full verification；不能把项目 reader 的信任扩展到未经导入的外部文件。

精确 locator / Run / Experiment 按目标选择 Core，并按使用惰性加载附件；当前 Results 可以读取全部 Core，但不预解码无关附件。成员、来源 Attempt 和资源 Slot 用共享 Map 索引；View generation 轮询只读 publication clock。惰性附件沿用同一 session 的关闭与截止期限检查，当前评估中的 I/O 用 Effect.try 保留失败通道。

回归通过公开 CLI 和自定义 Adapter 创建真实发布结果，比较加入两个含 60000 条 trace event 的无关 Attempt 前后的 locator、Run、Experiment 读取成本，不窥探 SQLite。原候选的 locator 从 437 ms 升至 6067 ms，违反 before * 2 + 750 ms 的包络；正式 red 绑定本 Problem epoch 0。外部损坏 Record 的 fail-closed 另由既有 source-diagnostics owner 验证。

本轮在只读源的临时副本比较三个命令，show 为 12.90 → 1.10 秒、locator 为 10.61 → 0.47 秒、Experiment 为 15.43 → 1.98 秒；输出逐字节相同。对应峰值 RSS 为 508 → 221 MiB、333 → 194 MiB、433 → 295 MiB。这是固定 Record 的本机测量，不是浏览器、CI 或所有规模下的复杂度证明。

仍需区分 payload 放大与 metadata 扫描。sealed cutoff 的 count 与 Experiment metadata 过滤仍随 Run 数增长，现有 schema 没有 Experiment 索引；本轮不改物理 schema。reuse/carry 的 captureReaderSnapshot 与 reuse-plan 仍构造全部历史快照，需要另行明确 scoped snapshot 的资源所有权。E2B cache generation 使用 MAX(generation)，没有相应索引；这里只取得静态成本证据，未测延迟。以上均不应被表述为已经实现严格 O(目标 Run 数) 的总成本。
