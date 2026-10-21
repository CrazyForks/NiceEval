---
format: concord.document/v1
id: project-numeric-material-shims
title: 项目重复实现缺失数值与分位数材料
createdAt: 2026-10-21
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-21T14:27:09.572Z
    action: resolve
    reason: Native measured and quantile preserve unavailable inputs and expose sample statistics; installed baseline red and complete candidate reliability proof are registered.
    resolution:
      kind: fixed
      reason: Native measured and quantile preserve unavailable inputs and expose sample statistics; installed baseline red and complete candidate reliability proof are registered.
      at: 2026-10-21T14:27:09.572Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/project-numeric-material-shims.md
        epoch: 0
        validatedAt: 2026-10-21T14:27:06.500Z
        cases:
          - selector: e2e/eval/test/assertion-values.test.ts#neref_57c9c7d39116a20999c0ad0f489b6702
            caseId: neref_57c9c7d39116a20999c0ad0f489b6702
            binding:
              kind: direct-contract
              contractRef: docs/feature/assertions/README.md
              contractSha256: 303e4e67be5ae02acefbabcc86a5a4cc39e2d73382d07c7198e0edeb6f7af35c
            sourceDigest: sha256:24da06a9f161f1c13d0058b600b8ba4ac33d6db1f11405d5e64a2e343205d2b1
            candidateSha256: 5c69114b738ffdee986699c6cb33d590a2982f2c9b926dc981ae9b5225f95a6e
            sourceIdentityDigest: 35c1b8f6443126f4b81504d58786c0b0186730c7bdbdcadcc53b528c6336ce9a
            red:
              path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/red.json
              digest: sha256:37a94ebf1e4bfe2bf78e79292044b002158e14e61309c5ad14c54f91df6b674f
            green:
              path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/green.json
              digest: sha256:e66abc9d5d286083f6b66b98260cb582e7c8853d7396c923458e88384903f145
            certificate:
              path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/certificate.json
              digest: sha256:d1cb70b41c51eeeac02073c36839fae8f654972a853a66e59c0efadd488973b3
            inventory:
              path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/inventory.json
              digest: sha256:5d15c6fa6fa29ba612237f9871065c080504257ae34d4bf890849bc15d35450c
            reliability:
              - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-1.json
                digest: sha256:855539309200003d7e3bbd7043fc72facc0106c18b41a32abf87c72d228246f0
              - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-2.json
                digest: sha256:8cc62be4e2c3c38c4497a6cdc3cb4b461967aa3430070bd5edccdeb7d2f03850
              - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-3.json
                digest: sha256:353bbdc177cec5bd33436c5c52f269fab6e7cf71e559c922487cf9c7e4d108b6
              - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-4.json
                digest: sha256:5177da930724f065f0b5c108129f3f7dcb6e91f4fdc244f9472af482f51f6ea9
              - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-5.json
                digest: sha256:8a46979940b468ffc894f69d0ccc1d2f6608e380764305f1964d2dddbb9111ff
              - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-6.json
                digest: sha256:7fa366b392a7231d33bce93b3153b9cdb753f62e309075a2521e2b03ec1f88b4
            invocationIds:
              - ef39e210-77b7-49d1-bddb-5d75fc6e337d
              - c594311b-39e2-4106-bb1e-b23ad77eb9a1
              - 96031916-3d45-441f-95f4-a9446dfa7f8a
              - ee74b87f-fd46-44d0-ab6f-d38a44624a8c
              - aefcbad0-b78f-4e38-9bfd-12ea4bb66a45
              - 7c6378de-f772-4122-8919-9020ffa43015
              - cfe787b0-b90c-48ee-bb51-1468aa5fd8ec
              - 429c5746-f1e9-48a0-bc84-dce322912bf4
    commit: 7465ed438263771164ea5dcb5d3f6e50f410d950
resolution:
  kind: fixed
  reason: Native measured and quantile preserve unavailable inputs and expose sample statistics; installed baseline red and complete candidate reliability proof are registered.
  at: 2026-10-21T14:27:09.572Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/project-numeric-material-shims.md
    epoch: 0
    validatedAt: 2026-10-21T14:27:06.500Z
    cases:
      - selector: e2e/eval/test/assertion-values.test.ts#neref_57c9c7d39116a20999c0ad0f489b6702
        caseId: neref_57c9c7d39116a20999c0ad0f489b6702
        binding:
          kind: direct-contract
          contractRef: docs/feature/assertions/README.md
          contractSha256: 303e4e67be5ae02acefbabcc86a5a4cc39e2d73382d07c7198e0edeb6f7af35c
        sourceDigest: sha256:24da06a9f161f1c13d0058b600b8ba4ac33d6db1f11405d5e64a2e343205d2b1
        candidateSha256: 5c69114b738ffdee986699c6cb33d590a2982f2c9b926dc981ae9b5225f95a6e
        sourceIdentityDigest: 35c1b8f6443126f4b81504d58786c0b0186730c7bdbdcadcc53b528c6336ce9a
        red:
          path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/red.json
          digest: sha256:37a94ebf1e4bfe2bf78e79292044b002158e14e61309c5ad14c54f91df6b674f
        green:
          path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/green.json
          digest: sha256:e66abc9d5d286083f6b66b98260cb582e7c8853d7396c923458e88384903f145
        certificate:
          path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/certificate.json
          digest: sha256:d1cb70b41c51eeeac02073c36839fae8f654972a853a66e59c0efadd488973b3
        inventory:
          path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/inventory.json
          digest: sha256:5d15c6fa6fa29ba612237f9871065c080504257ae34d4bf890849bc15d35450c
        reliability:
          - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-1.json
            digest: sha256:855539309200003d7e3bbd7043fc72facc0106c18b41a32abf87c72d228246f0
          - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-2.json
            digest: sha256:8cc62be4e2c3c38c4497a6cdc3cb4b461967aa3430070bd5edccdeb7d2f03850
          - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-3.json
            digest: sha256:353bbdc177cec5bd33436c5c52f269fab6e7cf71e559c922487cf9c7e4d108b6
          - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-4.json
            digest: sha256:5177da930724f065f0b5c108129f3f7dcb6e91f4fdc244f9472af482f51f6ea9
          - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-5.json
            digest: sha256:8a46979940b468ffc894f69d0ccc1d2f6608e380764305f1964d2dddbb9111ff
          - path: e2e/eval/test/assertion-values.test.ts.case-evidence/neref_57c9c7d39116a20999c0ad0f489b6702/memory_project-numeric-material-shims.md/nered_1Z9VB7F00BXDBVR4-netake_HMTNRQMYTFEFKBMT/reliability-6.json
            digest: sha256:7fa366b392a7231d33bce93b3153b9cdb753f62e309075a2521e2b03ec1f88b4
        invocationIds:
          - ef39e210-77b7-49d1-bddb-5d75fc6e337d
          - c594311b-39e2-4106-bb1e-b23ad77eb9a1
          - 96031916-3d45-441f-95f4-a9446dfa7f8a
          - ee74b87f-fd46-44d0-ab6f-d38a44624a8c
          - aefcbad0-b78f-4e38-9bfd-12ea4bb66a45
          - 7c6378de-f772-4122-8919-9020ffa43015
          - cfe787b0-b90c-48ee-bb51-1468aa5fd8ec
          - 429c5746-f1e9-48a0-bc84-dce322912bf4
---
使用方为 null 到 unavailable 的转换和 p50/p90 的线性插值维护重复 helper；裸 null 若被数值转换会错误地变成零。
目标是 measured(value, { unavailable }) 与 quantile(samples, p, { method })，统一拒绝无样本、非有限值并保留样本数量及算法元数据。
验收通过安装后评估的 Assertion 与评分结果，覆盖 null、空集合、非有限值、端点、线性插值和 nearest-rank；不对无样本输出零分。
正式契约见 docs/feature/assertions/library.md。
