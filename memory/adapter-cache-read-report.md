---
format: concord.document/v1
id: adapter-cache-read-report
title: Adapter 缺少按模型用途的原生缓存读取率判定
createdAt: 2026-10-21
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-21T11:44:32.086Z
    action: resolve
    reason: Native cache read reports and atLeast gates passed installed public-entry red, green and complete takeover validation; Query, Show and View expose coverage and missing reasons.
    resolution:
      kind: fixed
      reason: Native cache read reports and atLeast gates passed installed public-entry red, green and complete takeover validation; Query, Show and View expose coverage and missing reasons.
      at: 2026-10-21T11:44:32.086Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/adapter-cache-read-report.md
        epoch: 0
        validatedAt: 2026-10-21T11:44:28.212Z
        cases:
          - selector: e2e/inspection/test/cache-read.test.ts#neref_cf2aa7ef92ee58ae68e3b99f18986b80
            caseId: neref_cf2aa7ef92ee58ae68e3b99f18986b80
            binding:
              kind: direct-contract
              contractRef: docs/feature/adapters/README.md
              contractSha256: 95f13a8238635de3ae40e4888efbb985bd593c7b948eeacc02253480a3dd07ca
            sourceDigest: sha256:ea19d8d6ea42a736d18d9b546a18e20d18c858f9f9366a49bfb0fd3d7cef0219
            candidateSha256: 1e6bd499a8c2bfdec0c709cdcd00bb29de9438773d8a4c309c9aa6a4cde8aed2
            sourceIdentityDigest: fbcefbd0ac324d487df69b8bd75dfa8a8ef4c3fbdd2da63bb0929bcdb13c50fc
            red:
              path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/red.json
              digest: sha256:4e075995df0681c13834a4ff30904c7d14ff492b34c20ba66ef31a6eed9e05de
            green:
              path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/green.json
              digest: sha256:aa87d1ab650f7d2a0b71eedc768417e45496d0fa01d03a88eb459f30caae428e
            certificate:
              path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/certificate.json
              digest: sha256:3f2864be64d6274bc7c39697a97cd908367319ba07d9a74a955b58b0eed3caf7
            inventory:
              path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/inventory.json
              digest: sha256:98040e6c13639c64092f095b62dbd6e2d5984972410fbb1e7e7bf58a131974c5
            reliability:
              - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-1.json
                digest: sha256:a4beda397134897934aa3ce0de042ffdc98578696ecc2ae29bd01dc1ff87a6ae
              - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-2.json
                digest: sha256:1ed8ee12647047e7e665962fbc8ffc4814f0d606057731d6fe371cd93a84aef0
              - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-3.json
                digest: sha256:ee69a12cb531c1809289e2efee77b11cd02572528009a96a059d845364278eb3
              - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-4.json
                digest: sha256:ef486504c91ce36589c4a16dda29bb19f4dfa47619bee425b4b2f725ab37cb14
              - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-5.json
                digest: sha256:ff93f1fc97bb35780d94ade7b961014743a996520124a579038d555da14bf495
              - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-6.json
                digest: sha256:da705b2d2c0adfbb033088e4ad248e8a17ff7dfd357584157997a679c27be22f
            invocationIds:
              - 9f302ecc-3f81-4e33-adec-c2a7248a82d6
              - 939250ab-a208-4ee7-94a8-50482be8a305
              - ce480cd7-8ef2-408c-97a5-0a0ac314e98b
              - ae142955-3836-4c46-8aa1-b5e687afb61c
              - f73573f3-199c-4cc1-a9a3-9091b824bd25
              - 921afaa3-01cf-4b7e-982d-ba39d55d1760
              - 9cd87b3c-31c5-4757-be44-ac4b0c6746a2
              - 7553c4a5-b406-4ae6-844e-c330e78bfbe5
    commit: 0c760449cce8ceaeffa286cf34eac03f8305be19
resolution:
  kind: fixed
  reason: Native cache read reports and atLeast gates passed installed public-entry red, green and complete takeover validation; Query, Show and View expose coverage and missing reasons.
  at: 2026-10-21T11:44:32.086Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/adapter-cache-read-report.md
    epoch: 0
    validatedAt: 2026-10-21T11:44:28.212Z
    cases:
      - selector: e2e/inspection/test/cache-read.test.ts#neref_cf2aa7ef92ee58ae68e3b99f18986b80
        caseId: neref_cf2aa7ef92ee58ae68e3b99f18986b80
        binding:
          kind: direct-contract
          contractRef: docs/feature/adapters/README.md
          contractSha256: 95f13a8238635de3ae40e4888efbb985bd593c7b948eeacc02253480a3dd07ca
        sourceDigest: sha256:ea19d8d6ea42a736d18d9b546a18e20d18c858f9f9366a49bfb0fd3d7cef0219
        candidateSha256: 1e6bd499a8c2bfdec0c709cdcd00bb29de9438773d8a4c309c9aa6a4cde8aed2
        sourceIdentityDigest: fbcefbd0ac324d487df69b8bd75dfa8a8ef4c3fbdd2da63bb0929bcdb13c50fc
        red:
          path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/red.json
          digest: sha256:4e075995df0681c13834a4ff30904c7d14ff492b34c20ba66ef31a6eed9e05de
        green:
          path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/green.json
          digest: sha256:aa87d1ab650f7d2a0b71eedc768417e45496d0fa01d03a88eb459f30caae428e
        certificate:
          path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/certificate.json
          digest: sha256:3f2864be64d6274bc7c39697a97cd908367319ba07d9a74a955b58b0eed3caf7
        inventory:
          path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/inventory.json
          digest: sha256:98040e6c13639c64092f095b62dbd6e2d5984972410fbb1e7e7bf58a131974c5
        reliability:
          - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-1.json
            digest: sha256:a4beda397134897934aa3ce0de042ffdc98578696ecc2ae29bd01dc1ff87a6ae
          - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-2.json
            digest: sha256:1ed8ee12647047e7e665962fbc8ffc4814f0d606057731d6fe371cd93a84aef0
          - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-3.json
            digest: sha256:ee69a12cb531c1809289e2efee77b11cd02572528009a96a059d845364278eb3
          - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-4.json
            digest: sha256:ef486504c91ce36589c4a16dda29bb19f4dfa47619bee425b4b2f725ab37cb14
          - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-5.json
            digest: sha256:ff93f1fc97bb35780d94ade7b961014743a996520124a579038d555da14bf495
          - path: e2e/inspection/test/cache-read.test.ts.case-evidence/neref_cf2aa7ef92ee58ae68e3b99f18986b80/memory_adapter-cache-read-report.md/nered_TS9W9QYZV0FDEQQM-netake_AV5E1H3TV7QVJJ3Q/reliability-6.json
            digest: sha256:da705b2d2c0adfbb033088e4ad248e8a17ff7dfd357584157997a679c27be22f
        invocationIds:
          - 9f302ecc-3f81-4e33-adec-c2a7248a82d6
          - 939250ab-a208-4ee7-94a8-50482be8a305
          - ce480cd7-8ef2-408c-97a5-0a0ac314e98b
          - ae142955-3836-4c46-8aa1-b5e687afb61c
          - f73573f3-199c-4cc1-a9a3-9091b824bd25
          - 921afaa3-01cf-4b7e-982d-ba39d55d1760
          - 9cd87b3c-31c5-4757-be44-ac4b0c6746a2
          - 7553c4a5-b406-4ae6-844e-c330e78bfbe5
---
用户需要在 eval 中按 modelSlot 判定缓存读取率，并在 Query、Show 与 View 中核对相同的数值及输入覆盖率。旧版只提供 token 总量，各项目自行选择分母和缺失口径，无法统一判断无样本与不完整账本。

目标契约见 docs/feature/adapters/library.md 的缓存读取率。采用含缓存输入总量作为分母，按物理调用的 token 加权，缺失、零分母及未声明完整的账本不可判定。
