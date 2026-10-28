---
format: concord.document/v1
id: adapter-context-note-type-missing
title: Adapter Eval 类型遗漏已实现的 note 方法
createdAt: 2026-10-28
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-28T04:57:20.054Z
    action: resolve
    reason: 安装后类型 owner 在旧候选产生 TS2339 红灯；修复候选的隔离、同副本、默认并行和单项重跑全部通过，已绑定同一清单及 Problem epoch 的正式收据。
    resolution:
      kind: fixed
      reason: 安装后类型 owner 在旧候选产生 TS2339 红灯；修复候选的隔离、同副本、默认并行和单项重跑全部通过，已绑定同一清单及 Problem epoch 的正式收据。
      at: 2026-10-28T04:57:20.054Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/adapter-context-note-type-missing.md
        epoch: 0
        validatedAt: 2026-10-28T04:57:00.513Z
        cases:
          - selector: e2e/eval/test/application-types.test.ts#neref_4172336b123c84c9148176d2bfe10b19
            caseId: neref_4172336b123c84c9148176d2bfe10b19
            binding:
              kind: direct-contract
              contractRef: docs/feature/eval/use-case/eval-native-operations.md
              contractSha256: c8933e80c4afeda309e3454bf3e8fe85c80e95e272dc398ccd5c53957187c6f9
            sourceDigest: sha256:59214c6973d8b2847d8a28def9e6389db79aa9cb00fa1962e635be8da6add75a
            candidateSha256: 13aa388faed6252b9585a78496ce6c066454a227c3322f676d695ef2b42c9dff
            sourceIdentityDigest: 1f9792d6e337c7ff80b072aa1b71d4c6b2ad026cfc6d62af75d89c79bdf8169b
            red:
              path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/red.json
              digest: sha256:1ff483170fec42cab51de8dc19f6f0c2a47742ff3b6b7de82ec3378a27d1e1f3
            green:
              path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/green.json
              digest: sha256:a934f177a4fec4b029c64ab65cd69739fde3edde81c005fc32e326fe0f66a63e
            certificate:
              path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/certificate.json
              digest: sha256:07bdd8f44c7a55b9824b14fd5cd86aeaa667a6c47eb0d05d29f30db8f6b99ac9
            inventory:
              path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/inventory.json
              digest: sha256:22c88abed501caa1809dea2a96fbfd8a967035972f968b29f3ce515eaff3714b
            reliability:
              - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-1.json
                digest: sha256:776f8733adc57848f2dcaf71346fca02ccb9ff47d1ff3052231f0fc105ffeede
              - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-2.json
                digest: sha256:70c2de93a7cdc24ccdd6e2ab2d9fbca465d7a69b8a2c48c8e324b276735fdd07
              - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-3.json
                digest: sha256:506f094f5b50246202ec849cffdd3b4f20b5de1fd6fd0f0c115be34f3f14dede
              - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-4.json
                digest: sha256:2c6aa978b5ea2be71390f7db1292d53aac168c4559dae79111fc5415dd49f63a
              - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-5.json
                digest: sha256:1385b5a0de686448f935e4c74fed26242fc400e7422018d5e9389a2f54f45728
              - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-6.json
                digest: sha256:c2d7a5103dc108fee085f59f5cb0bb1fe1198a24517035be9bd7e8d175d4ab4d
            invocationIds:
              - 2bebbf5e-bdb3-4d0f-8d51-6a5b42b96aa3
              - 75737ce3-5e99-449c-a2fb-8556f396ee8b
              - 8820de2c-d059-439f-b91e-aca5d9724f53
              - 4c4bbf6a-9eab-4952-87f9-322bd178bc36
              - 7a1c646c-2660-40bc-a4e5-75999e60a01c
              - a61eaf64-29f0-47df-8978-228dc1e43fb0
              - 57acbb69-517a-4b20-8045-8cb31da85be3
              - 41eea127-5d45-4ae1-bd50-53df45477d43
    commit: feb8b5b2752922c8f5fe8fcc67d93e6770b7d560
resolution:
  kind: fixed
  reason: 安装后类型 owner 在旧候选产生 TS2339 红灯；修复候选的隔离、同副本、默认并行和单项重跑全部通过，已绑定同一清单及 Problem epoch 的正式收据。
  at: 2026-10-28T04:57:20.054Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/adapter-context-note-type-missing.md
    epoch: 0
    validatedAt: 2026-10-28T04:57:00.513Z
    cases:
      - selector: e2e/eval/test/application-types.test.ts#neref_4172336b123c84c9148176d2bfe10b19
        caseId: neref_4172336b123c84c9148176d2bfe10b19
        binding:
          kind: direct-contract
          contractRef: docs/feature/eval/use-case/eval-native-operations.md
          contractSha256: c8933e80c4afeda309e3454bf3e8fe85c80e95e272dc398ccd5c53957187c6f9
        sourceDigest: sha256:59214c6973d8b2847d8a28def9e6389db79aa9cb00fa1962e635be8da6add75a
        candidateSha256: 13aa388faed6252b9585a78496ce6c066454a227c3322f676d695ef2b42c9dff
        sourceIdentityDigest: 1f9792d6e337c7ff80b072aa1b71d4c6b2ad026cfc6d62af75d89c79bdf8169b
        red:
          path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/red.json
          digest: sha256:1ff483170fec42cab51de8dc19f6f0c2a47742ff3b6b7de82ec3378a27d1e1f3
        green:
          path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/green.json
          digest: sha256:a934f177a4fec4b029c64ab65cd69739fde3edde81c005fc32e326fe0f66a63e
        certificate:
          path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/certificate.json
          digest: sha256:07bdd8f44c7a55b9824b14fd5cd86aeaa667a6c47eb0d05d29f30db8f6b99ac9
        inventory:
          path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/inventory.json
          digest: sha256:22c88abed501caa1809dea2a96fbfd8a967035972f968b29f3ce515eaff3714b
        reliability:
          - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-1.json
            digest: sha256:776f8733adc57848f2dcaf71346fca02ccb9ff47d1ff3052231f0fc105ffeede
          - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-2.json
            digest: sha256:70c2de93a7cdc24ccdd6e2ab2d9fbca465d7a69b8a2c48c8e324b276735fdd07
          - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-3.json
            digest: sha256:506f094f5b50246202ec849cffdd3b4f20b5de1fd6fd0f0c115be34f3f14dede
          - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-4.json
            digest: sha256:2c6aa978b5ea2be71390f7db1292d53aac168c4559dae79111fc5415dd49f63a
          - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-5.json
            digest: sha256:1385b5a0de686448f935e4c74fed26242fc400e7422018d5e9389a2f54f45728
          - path: e2e/eval/test/application-types.test.ts.case-evidence/neref_4172336b123c84c9148176d2bfe10b19/memory_adapter-context-note-type-missing.md/nered_R2CNN6FCQAZGDXGD-netake_21W3SH1P9JQW386E/reliability-6.json
            digest: sha256:c2d7a5103dc108fee085f59f5cb0bb1fe1198a24517035be9bd7e8d175d4ab4d
        invocationIds:
          - 2bebbf5e-bdb3-4d0f-8d51-6a5b42b96aa3
          - 75737ce3-5e99-449c-a2fb-8556f396ee8b
          - 8820de2c-d059-439f-b91e-aca5d9724f53
          - 4c4bbf6a-9eab-4952-87f9-322bd178bc36
          - 7a1c646c-2660-40bc-a4e5-75999e60a01c
          - a61eaf64-29f0-47df-8978-228dc1e43fb0
          - 57acbb69-517a-4b20-8045-8cb31da85be3
          - 41eea127-5d45-4ae1-bd50-53df45477d43
---
# Adapter Eval 类型遗漏已实现的 note 方法

## 问题

Adapter 的 Pass 与 Score Eval 在运行时可以登记 Note，但 EvalContextBase 未声明 note。TypeScript 消费者因而不能直接调用该方法。

## 根因与修复方向

中立 Adapter context 与 AssertFirstCoreTestContext 分别声明公开能力，note 仅出现在后者。Adapter 应复用同一个 note 签名，保留 JSON、Quantity 与 void 返回约束。

## 验证

加强现有 application-types 安装后 E2E owner，覆盖两种 Eval 的合法 Note、Quantity 和非法参数。通过旧候选红灯和修复候选接管收据后再解决本 Problem。
