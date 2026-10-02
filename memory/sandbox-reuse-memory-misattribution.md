---
format: concord.document/v1
id: sandbox-reuse-memory-misattribution
title: Sandbox 复用失败诊断把有意持久记忆推断为污染
createdAt: 2026-10-02
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-02T07:21:29.864Z
    action: resolve
    reason: Installed CLI preserves intentional-memory semantics and passes native reliability takeover netake_MTS9EA0P9VC3FYT3 with the final Runner fixtures.
    resolution:
      kind: fixed
      reason: Installed CLI preserves intentional-memory semantics and passes native reliability takeover netake_MTS9EA0P9VC3FYT3 with the final Runner fixtures.
      at: 2026-10-02T07:21:29.864Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/sandbox-reuse-memory-misattribution.md
        epoch: 0
        validatedAt: 2026-10-02T07:21:26.258Z
        cases:
          - selector: e2e/runner/test/reuse-memory-diagnostic.test.ts#neref_1d61fe52ae0ab34c006ebeedbd505a14
            caseId: neref_1d61fe52ae0ab34c006ebeedbd505a14
            binding:
              kind: direct-contract
              contractRef: docs/feature/sandbox/README.md
              contractSha256: 0b0cc9ce3d3f0c5c271db4af78dfe59c6a4a5979279680582060da422f141732
            sourceDigest: sha256:88746273a457f9404b364cd7d7fdf24150b7d4c1ede2b7d40939c8fc54a90a65
            candidateSha256: 09ae81158f5cc3812a95f39f3c643ab3bc7f1532f73553249135138397045c3d
            sourceIdentityDigest: c5bed29f60942765fa8e1aece7e84eccd8a6e7e7413530cbfa88938ca7f1fb48
            red:
              path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/red.json
              digest: sha256:92bcef5dcd97cac566fd4b32e4874b54dc8044c980c1a30a87ef7d04e6981184
            green:
              path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/green.json
              digest: sha256:0b1117364b2aa4fac96ce416a24e3bc73f9b338d832f2d3d20a7a5ba63a250a7
            certificate:
              path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/certificate.json
              digest: sha256:e2bc9b9901e28bee80deba71c7d380a5dbc3cff5a889315bafe900a8c9a5d179
            inventory:
              path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/inventory.json
              digest: sha256:b2f41a4cdff4bc3336709e943878832f3dc3634d73373a8fa2c4f02d91e64663
            reliability:
              - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-1.json
                digest: sha256:758163e54b4174e0f80ecac2ec9b67719c0715038ff3d46bf1a65cabcf5a3638
              - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-2.json
                digest: sha256:0f03f872eb577202c4d6945238bcd5cd7dfee3cb7836fd09bff3d6fe6f09503c
              - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-3.json
                digest: sha256:0e4e610415ccd88e6ed21c3631511ca6e3bcf4857ddce013778e6d57e1eb22b7
              - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-4.json
                digest: sha256:202dae76e5bd4e109eb87320bd6eab9b5fbdf43730bda11868ca646c797852e3
              - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-5.json
                digest: sha256:d8f94d33c553652448da3b1e6fac0689c5fc49dc503f1e34e0fe4eb8e33d4240
              - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-6.json
                digest: sha256:7d05f4a39c51659a425e1603a8ad304efa1fee48acfd2c5f61a717cb79b9a797
            invocationIds:
              - 58e40be0-8470-4d48-8831-cc790e4223b5
              - c43b458b-a71a-486d-be0a-d1d0c509cd54
              - 9450cf0b-014b-4bdb-b6fe-11831bc2106a
              - 772d3d1c-a74a-46a9-b049-0720348ebcf4
              - 19be54b4-c994-4c0e-9803-185b5f95e5e9
              - 7f71c976-0412-4b3f-b046-631f1f74d6dd
              - fe915832-893e-4e3c-ab3f-aa4c057608a1
              - 18bd3e4d-996b-46b3-ba41-c5bd5ad31cf3
    commit: 2f71de951f9f8244350da5da4aa288d30fcef334
resolution:
  kind: fixed
  reason: Installed CLI preserves intentional-memory semantics and passes native reliability takeover netake_MTS9EA0P9VC3FYT3 with the final Runner fixtures.
  at: 2026-10-02T07:21:29.864Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/sandbox-reuse-memory-misattribution.md
    epoch: 0
    validatedAt: 2026-10-02T07:21:26.258Z
    cases:
      - selector: e2e/runner/test/reuse-memory-diagnostic.test.ts#neref_1d61fe52ae0ab34c006ebeedbd505a14
        caseId: neref_1d61fe52ae0ab34c006ebeedbd505a14
        binding:
          kind: direct-contract
          contractRef: docs/feature/sandbox/README.md
          contractSha256: 0b0cc9ce3d3f0c5c271db4af78dfe59c6a4a5979279680582060da422f141732
        sourceDigest: sha256:88746273a457f9404b364cd7d7fdf24150b7d4c1ede2b7d40939c8fc54a90a65
        candidateSha256: 09ae81158f5cc3812a95f39f3c643ab3bc7f1532f73553249135138397045c3d
        sourceIdentityDigest: c5bed29f60942765fa8e1aece7e84eccd8a6e7e7413530cbfa88938ca7f1fb48
        red:
          path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/red.json
          digest: sha256:92bcef5dcd97cac566fd4b32e4874b54dc8044c980c1a30a87ef7d04e6981184
        green:
          path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/green.json
          digest: sha256:0b1117364b2aa4fac96ce416a24e3bc73f9b338d832f2d3d20a7a5ba63a250a7
        certificate:
          path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/certificate.json
          digest: sha256:e2bc9b9901e28bee80deba71c7d380a5dbc3cff5a889315bafe900a8c9a5d179
        inventory:
          path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/inventory.json
          digest: sha256:b2f41a4cdff4bc3336709e943878832f3dc3634d73373a8fa2c4f02d91e64663
        reliability:
          - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-1.json
            digest: sha256:758163e54b4174e0f80ecac2ec9b67719c0715038ff3d46bf1a65cabcf5a3638
          - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-2.json
            digest: sha256:0f03f872eb577202c4d6945238bcd5cd7dfee3cb7836fd09bff3d6fe6f09503c
          - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-3.json
            digest: sha256:0e4e610415ccd88e6ed21c3631511ca6e3bcf4857ddce013778e6d57e1eb22b7
          - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-4.json
            digest: sha256:202dae76e5bd4e109eb87320bd6eab9b5fbdf43730bda11868ca646c797852e3
          - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-5.json
            digest: sha256:d8f94d33c553652448da3b1e6fac0689c5fc49dc503f1e34e0fe4eb8e33d4240
          - path: e2e/runner/test/reuse-memory-diagnostic.test.ts.case-evidence/neref_1d61fe52ae0ab34c006ebeedbd505a14/memory_sandbox-reuse-memory-misattribution.md/nered_0T0898C3J8JYA4N2-netake_MTS9EA0P9VC3FYT3/reliability-6.json
            digest: sha256:7d05f4a39c51659a425e1603a8ad304efa1fee48acfd2c5f61a717cb79b9a797
        invocationIds:
          - 58e40be0-8470-4d48-8831-cc790e4223b5
          - c43b458b-a71a-486d-be0a-d1d0c509cd54
          - 9450cf0b-014b-4bdb-b6fe-11831bc2106a
          - 772d3d1c-a74a-46a9-b049-0720348ebcf4
          - 19be54b4-c994-4c0e-9803-185b5f95e5e9
          - 7f71c976-0412-4b3f-b046-631f1f74d6dd
          - fe915832-893e-4e3c-ab3f-aa4c057608a1
          - 18bd3e4d-996b-46b3-ba41-c5bd5ad31cf3
---
公开 Experiment 声明 sandboxReuse，并让同一 Sandbox 的首条 Attempt 成功、后两条在同一阶段失败时，结束诊断把 workdir 外状态称为 likely cause，要求不得依赖前题状态。

失败聚集只能证明时间与实例上的相关性，不能证明污染。记忆实验允许跨 Attempt 保留有意状态；诊断应报告实例、承接序号与失败阶段，建议检查预期状态、非预期残留和重复准备。

公开入口验收使用三个 Attempt 的 Experiment，在 workdir 外写入累积记忆，确认聚集诊断可见、原失败结果保留且没有无依据的因果归属。
