---
format: concord.document/v1
id: inspection-source-detail-reuses-assertion-string-limit
title: 断言详情错误套用持久化字符串限制
createdAt: 2026-10-23
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-23T13:54:58.712Z
    action: resolve
    reason: Installed public CLI regression reproduced with the old candidate; the fixed candidate passed all seven takeover observations, including 37 default-parallel cases and resource cleanup. Source-row detail uses its own string policy while persisted assertion limits remain unchanged.
    resolution:
      kind: fixed
      reason: Installed public CLI regression reproduced with the old candidate; the fixed candidate passed all seven takeover observations, including 37 default-parallel cases and resource cleanup. Source-row detail uses its own string policy while persisted assertion limits remain unchanged.
      at: 2026-10-23T13:54:58.712Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/inspection-source-detail-reuses-assertion-string-limit.md
        epoch: 0
        validatedAt: 2026-10-23T13:54:38.018Z
        cases:
          - selector: e2e/inspection/test/inspection-query.test.ts#neref_bed902a18f5f371e36ec24256ebb6af7
            caseId: neref_bed902a18f5f371e36ec24256ebb6af7
            binding:
              kind: direct-contract
              contractRef: docs/feature/inspection/README.md
              contractSha256: aae956dcb5e772ff923311228244c1de250bf1c6297f67c8d2503a5af599cefb
            sourceDigest: sha256:2988a5d4e230a6819cfb27a00ee86fb432f774f1b950730f488a22c74017a702
            candidateSha256: 21ebcc8e00897576056fe2a723fa08499fe01b2a15684c00826a95a8344f5d38
            sourceIdentityDigest: a00aa51b68c138478c673bb242d8447bd65b41ef3e9e362f00af3a7febe75aa7
            red:
              path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/red.json
              digest: sha256:77289ce6b99a6919363b80085a4c08ecdbd414e83867ecd80ba5b62d75a7b61b
            green:
              path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/green.json
              digest: sha256:ae97dcd1fb21687fe0d512ceef8a9428d677a9134dd17e76baeb0d9df1ebe31b
            certificate:
              path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/certificate.json
              digest: sha256:a9116a714dd36b96171cd6573d45ddbbe44ec561a69eb8c89821911ae15fa686
            inventory:
              path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/inventory.json
              digest: sha256:3b4de04e7d076a3379292737ff872f1e9620e6e4a45b7c4fcc15220abb90cdc8
            reliability:
              - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-1.json
                digest: sha256:56f4b82bcd110f9152d82f78bf2d27582b064d1e005d46265686dd6886615f1b
              - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-2.json
                digest: sha256:f986bbe20a2d81cef0fc6b89e6c303ed5686a9897877f381f1a3a762a35b9fed
              - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-3.json
                digest: sha256:4aa0140c50bb5300c106549f210a9374e3a6f9b22a57e862bd727aa86c1d50bc
              - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-4.json
                digest: sha256:1e50a2596254582848e381dbed378d62b2fb2f9ca56dba3de74bbc07eb6187b6
              - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-5.json
                digest: sha256:c697e1fca2f9f268d106416973147fcd8a516922a753c87e77f33dae9f51ee26
              - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-6.json
                digest: sha256:e1d450a3a6a868380ffe5b7802c5f85e6d37ed34565cf1821f9b5578b16da463
            invocationIds:
              - 23c011a3-f44c-4759-81aa-f21725dfa86b
              - 6517d4c2-1dbf-4655-9b8f-20f9f787ea1f
              - 5b0f97f2-cd5d-4a08-ac5f-445431ec3b9b
              - 4f098d67-39b3-421d-998f-2658699162f7
              - 2da08473-25e4-43db-bbd7-9f8adeb1c896
              - 753cfe67-bc78-4749-a442-8889b815449c
              - a20cca55-bc2c-406a-94d7-152bd578d2fe
              - 327f8f1e-c296-4b8b-bc3f-bfe0143c84ca
    commit: 2bae65806c72b548ead8fff8c567522e8d0f14a2
resolution:
  kind: fixed
  reason: Installed public CLI regression reproduced with the old candidate; the fixed candidate passed all seven takeover observations, including 37 default-parallel cases and resource cleanup. Source-row detail uses its own string policy while persisted assertion limits remain unchanged.
  at: 2026-10-23T13:54:58.712Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/inspection-source-detail-reuses-assertion-string-limit.md
    epoch: 0
    validatedAt: 2026-10-23T13:54:38.018Z
    cases:
      - selector: e2e/inspection/test/inspection-query.test.ts#neref_bed902a18f5f371e36ec24256ebb6af7
        caseId: neref_bed902a18f5f371e36ec24256ebb6af7
        binding:
          kind: direct-contract
          contractRef: docs/feature/inspection/README.md
          contractSha256: aae956dcb5e772ff923311228244c1de250bf1c6297f67c8d2503a5af599cefb
        sourceDigest: sha256:2988a5d4e230a6819cfb27a00ee86fb432f774f1b950730f488a22c74017a702
        candidateSha256: 21ebcc8e00897576056fe2a723fa08499fe01b2a15684c00826a95a8344f5d38
        sourceIdentityDigest: a00aa51b68c138478c673bb242d8447bd65b41ef3e9e362f00af3a7febe75aa7
        red:
          path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/red.json
          digest: sha256:77289ce6b99a6919363b80085a4c08ecdbd414e83867ecd80ba5b62d75a7b61b
        green:
          path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/green.json
          digest: sha256:ae97dcd1fb21687fe0d512ceef8a9428d677a9134dd17e76baeb0d9df1ebe31b
        certificate:
          path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/certificate.json
          digest: sha256:a9116a714dd36b96171cd6573d45ddbbe44ec561a69eb8c89821911ae15fa686
        inventory:
          path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/inventory.json
          digest: sha256:3b4de04e7d076a3379292737ff872f1e9620e6e4a45b7c4fcc15220abb90cdc8
        reliability:
          - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-1.json
            digest: sha256:56f4b82bcd110f9152d82f78bf2d27582b064d1e005d46265686dd6886615f1b
          - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-2.json
            digest: sha256:f986bbe20a2d81cef0fc6b89e6c303ed5686a9897877f381f1a3a762a35b9fed
          - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-3.json
            digest: sha256:4aa0140c50bb5300c106549f210a9374e3a6f9b22a57e862bd727aa86c1d50bc
          - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-4.json
            digest: sha256:1e50a2596254582848e381dbed378d62b2fb2f9ca56dba3de74bbc07eb6187b6
          - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-5.json
            digest: sha256:c697e1fca2f9f268d106416973147fcd8a516922a753c87e77f33dae9f51ee26
          - path: e2e/inspection/test/inspection-query.test.ts.case-evidence/neref_bed902a18f5f371e36ec24256ebb6af7/memory_inspection-source-detail-reuses-assertion-string-limit.md/nered_YN7Y5HV9R4BMBT6S-netake_4WCGEHNG7403T66N/reliability-6.json
            digest: sha256:e1d450a3a6a868380ffe5b7802c5f85e6d37ed34565cf1821f9b5578b16da463
        invocationIds:
          - 23c011a3-f44c-4759-81aa-f21725dfa86b
          - 6517d4c2-1dbf-4655-9b8f-20f9f787ea1f
          - 5b0f97f2-cd5d-4a08-ac5f-445431ec3b9b
          - 4f098d67-39b3-421d-998f-2658699162f7
          - 2da08473-25e4-43db-bbd7-9f8adeb1c896
          - 753cfe67-bc78-4749-a442-8889b815449c
          - a20cca55-bc2c-406a-94d7-152bd578d2fe
          - 327f8f1e-c296-4b8b-bc3f-bfe0143c84ca
---
NiceEval-Eval 的 canary log-summary Attempt @19NMDTBRMSQXS 已完成，但公开 niceeval query 的 attempt.assertion.detail 对 ae_d85391749827cf900988 返回 inspection-operation-failed。最小安装后复现中，小工具输出正常，100000 字符工具输出令同一详情操作失败，Attempt 本身仍 passed。

根因是 Inspection 来源行 detail 复用持久化 AssertionFactValueSchema 的 8192 UTF-8 字节字符串限制。Agent Turns 的合法完整来源文本不受该断言保存预算约束，详情投影因而被解码器拒绝。

修正只分离 Inspection 来源行事实的字符串校验策略，保留持久化断言预算与响应总预算，不截断来源证据。验收强化现有 inspection-query machine consumer owner，通过安装候选的公开 CLI 检查长中文输入输出及尾标记，执行同 owner 红绿与 takeover。
