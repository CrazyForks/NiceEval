---
format: concord.document/v1
id: duplicate-public-entrypoints
title: 重复公开入口增加判据与工具的选择表面
createdAt: 2026-10-21
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-21T14:27:16.667Z
    action: resolve
    reason: Duplicate public aliases now have canonical imports and migration guidance; installed ESM, CJS and declaration checks have baseline red and complete candidate reliability proof.
    resolution:
      kind: fixed
      reason: Duplicate public aliases now have canonical imports and migration guidance; installed ESM, CJS and declaration checks have baseline red and complete candidate reliability proof.
      at: 2026-10-21T14:27:16.667Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/duplicate-public-entrypoints.md
        epoch: 0
        validatedAt: 2026-10-21T14:27:13.778Z
        cases:
          - selector: e2e/package/test/package.test.ts#neref_68937a313f7c9f25f48154a525450b55
            caseId: neref_68937a313f7c9f25f48154a525450b55
            binding:
              kind: direct-contract
              contractRef: docs/feature/eval/README.md
              contractSha256: d214f1a61c7cf64a47613e0ca7ae47af0e8f3e74dba54797e73a1f3cd7cbe612
            sourceDigest: sha256:89287b833b1b68d7556e54c8d2f1196e1ba0f39c13bea833d051502daf285eee
            candidateSha256: 5c69114b738ffdee986699c6cb33d590a2982f2c9b926dc981ae9b5225f95a6e
            sourceIdentityDigest: 2f9c88fcb4d07ff2c3d182afa82361fd52793eea066cf1fa54215e8e392109bc
            red:
              path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/red.json
              digest: sha256:2c2cebbb6ddb0700cbee70e700450262229611e47a3950adfdd45c0e7a19cf51
            green:
              path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/green.json
              digest: sha256:1a0d1bfd6c26c4a3482ffacd67724210d1fbce59abbbb5cf146de16593da27d9
            certificate:
              path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/certificate.json
              digest: sha256:8322b80e34fe6aa6a5f098b030ad4690eb3eee652d31523344f31472a29befae
            inventory:
              path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/inventory.json
              digest: sha256:ec91381afd797119b8b556315adb5f9dc5d7763516847a73b18eef8446c88839
            reliability:
              - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-1.json
                digest: sha256:2c393dbf9f06c8b45fd8798ad6ca2db53bc79c8fb02b7b7b03f48611a4f54f83
              - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-2.json
                digest: sha256:b615c16bad2dd5019e062e8a5730320866131a713199ccafee45266a3d60e61f
              - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-3.json
                digest: sha256:f19013ba4de92b148fc90954267257f5d25ad50ae1429f2b8022936b0c568e4c
              - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-4.json
                digest: sha256:9b144d2403e19d4a019d976e3207660260555683527023c16970ac73bce2113c
              - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-5.json
                digest: sha256:6c572861360aef330f47f22dcabc506c69d0e98c1e94e6384e13dd0584b5f7e2
              - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-6.json
                digest: sha256:74c0ac82b85534bbd88a875b003fd645ee470a63538bc1c5b5d443720df8b745
            invocationIds:
              - 75283e62-b172-4c79-bbd5-fcaf4f7bf022
              - 4c0022fc-1dcb-4228-b7d4-a17f00ed4f0b
              - 2933a8e7-1f12-4e6c-a895-0b27db2ad542
              - 4caf1623-c5d7-49b8-b887-c9fcb1fe75ef
              - 6eef1b98-d1d7-4578-89d1-fd032199dad8
              - 151a8478-e5a9-4dd2-8b09-31ee1c7d3c5f
              - 8e24a7f3-45d0-4f3c-9d97-aac72dc48c60
              - a3ae2b5e-b72d-41ff-b854-3200ccfbc78e
    commit: 7465ed438263771164ea5dcb5d3f6e50f410d950
resolution:
  kind: fixed
  reason: Duplicate public aliases now have canonical imports and migration guidance; installed ESM, CJS and declaration checks have baseline red and complete candidate reliability proof.
  at: 2026-10-21T14:27:16.667Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/duplicate-public-entrypoints.md
    epoch: 0
    validatedAt: 2026-10-21T14:27:13.778Z
    cases:
      - selector: e2e/package/test/package.test.ts#neref_68937a313f7c9f25f48154a525450b55
        caseId: neref_68937a313f7c9f25f48154a525450b55
        binding:
          kind: direct-contract
          contractRef: docs/feature/eval/README.md
          contractSha256: d214f1a61c7cf64a47613e0ca7ae47af0e8f3e74dba54797e73a1f3cd7cbe612
        sourceDigest: sha256:89287b833b1b68d7556e54c8d2f1196e1ba0f39c13bea833d051502daf285eee
        candidateSha256: 5c69114b738ffdee986699c6cb33d590a2982f2c9b926dc981ae9b5225f95a6e
        sourceIdentityDigest: 2f9c88fcb4d07ff2c3d182afa82361fd52793eea066cf1fa54215e8e392109bc
        red:
          path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/red.json
          digest: sha256:2c2cebbb6ddb0700cbee70e700450262229611e47a3950adfdd45c0e7a19cf51
        green:
          path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/green.json
          digest: sha256:1a0d1bfd6c26c4a3482ffacd67724210d1fbce59abbbb5cf146de16593da27d9
        certificate:
          path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/certificate.json
          digest: sha256:8322b80e34fe6aa6a5f098b030ad4690eb3eee652d31523344f31472a29befae
        inventory:
          path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/inventory.json
          digest: sha256:ec91381afd797119b8b556315adb5f9dc5d7763516847a73b18eef8446c88839
        reliability:
          - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-1.json
            digest: sha256:2c393dbf9f06c8b45fd8798ad6ca2db53bc79c8fb02b7b7b03f48611a4f54f83
          - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-2.json
            digest: sha256:b615c16bad2dd5019e062e8a5730320866131a713199ccafee45266a3d60e61f
          - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-3.json
            digest: sha256:f19013ba4de92b148fc90954267257f5d25ad50ae1429f2b8022936b0c568e4c
          - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-4.json
            digest: sha256:9b144d2403e19d4a019d976e3207660260555683527023c16970ac73bce2113c
          - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-5.json
            digest: sha256:6c572861360aef330f47f22dcabc506c69d0e98c1e94e6384e13dd0584b5f7e2
          - path: e2e/package/test/package.test.ts.case-evidence/neref_68937a313f7c9f25f48154a525450b55/memory_duplicate-public-entrypoints.md/nered_2BCWWBSRX85MNGNZ-netake_52X0WN239HX5NTM0/reliability-6.json
            digest: sha256:74c0ac82b85534bbd88a875b003fd645ee470a63538bc1c5b5d443720df8b745
        invocationIds:
          - 75283e62-b172-4c79-bbd5-fcaf4f7bf022
          - 4c0022fc-1dcb-4228-b7d4-a17f00ed4f0b
          - 2933a8e7-1f12-4e6c-a895-0b27db2ad542
          - 4caf1623-c5d7-49b8-b887-c9fcb1fe75ef
          - 6eef1b98-d1d7-4578-89d1-fd032199dad8
          - 151a8478-e5a9-4dd2-8b09-31ee1c7d3c5f
          - 8e24a7f3-45d0-4f3c-9d97-aac72dc48c60
          - a3ae2b5e-b72d-41ff-b854-3200ccfbc78e
---
根入口与 /expect 重复导出八个判据工厂，readScoreMatchAudit 也同时出现在根入口与 /inspection。
此外根入口暴露与评估无关的环境和文本工具，Sandbox 暴露两个同实现 resolver 名称；未调用的锁期限常量仅为源码兼容保留。
0.18 将判据构造收敛到 /expect，审计 reader 收敛到 /inspection，移除列举的工具导出与同义名称。
核心实现、模块身份、类型与失败隔离出口保留；精确删除集合、迁移和验收见 docs/api-design.md。
安装候选需证明保留出口存在、旧出口缺失，双模块与双声明消费者仍能工作。
