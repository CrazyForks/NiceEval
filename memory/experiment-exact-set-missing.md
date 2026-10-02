---
format: concord.document/v1
id: experiment-exact-set-missing
title: CLI 无法在一次 Invocation 中精确选择离散实验
createdAt: 2026-10-02
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-02T07:12:24.862Z
    action: resolve
    reason: Installed CLI candidate selects exact deduplicated Experiment IDs within one Invocation, rejects missing IDs, and passes native reliability takeover netake_SJR99DDVQ28E28WS.
    resolution:
      kind: fixed
      reason: Installed CLI candidate selects exact deduplicated Experiment IDs within one Invocation, rejects missing IDs, and passes native reliability takeover netake_SJR99DDVQ28E28WS.
      at: 2026-10-02T07:12:24.862Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/experiment-exact-set-missing.md
        epoch: 0
        validatedAt: 2026-10-02T07:12:19.783Z
        cases:
          - selector: e2e/cli/test/experiment-set.test.ts#neref_6aaf27dac46b66e5b62ee49222d0c257
            caseId: neref_6aaf27dac46b66e5b62ee49222d0c257
            binding:
              kind: direct-contract
              contractRef: docs/feature/experiments/README.md
              contractSha256: 2fdbc58d677acb5ecbb6aaa29dd8d7b7aa66e9c21fbd147857b3d8171f5645ee
            sourceDigest: sha256:b8fdc94a160d22cacb8dc7326d38f0477a6680af3244bf7209eb7b8aad6009e7
            candidateSha256: 09ae81158f5cc3812a95f39f3c643ab3bc7f1532f73553249135138397045c3d
            sourceIdentityDigest: d5379ef9c01f9d111507502bc6178b8790f4f0824f637ed3e4f5c65fb5eddf2d
            red:
              path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/red.json
              digest: sha256:8a819964bce3ce86e7857a387c51ff2188cf3fbca785096db265523f23ba9319
            green:
              path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/green.json
              digest: sha256:2fdfb1a9fdfc5c7ee842b36a483b28af28cb53f0ae4dadcb37e3f68217cca535
            certificate:
              path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/certificate.json
              digest: sha256:86e25ac56a433a469b0d01c04c3d720d46db92548c545d02c5113e56a4ddb289
            inventory:
              path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/inventory.json
              digest: sha256:438b11c1d878d177d0d0c76f34b57ee8910ad3897f9e1a789bb523c6bf9605c5
            reliability:
              - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-1.json
                digest: sha256:39c714a4d95133a6ad75d8926b1ea26e34d57f3e9061fede29f9152f2f978808
              - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-2.json
                digest: sha256:a115384ef8242b1328b9bad880445ff1806b5d49fbeb2c801d9dd4655ac1add8
              - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-3.json
                digest: sha256:b7df4ad558878ee25fad36c96706119ad9d2fbeebddfd68e9bd523af57b0d9b0
              - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-4.json
                digest: sha256:cd99035173f9056afa113f7259f69a2d310a42db16e33a0ba5415ee54233ca8d
              - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-5.json
                digest: sha256:52c0846bc61788a6deb132713971a1715f9ac58ea1d5494afea0c182168d42bc
              - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-6.json
                digest: sha256:81633fa1514e9e5c0be9db83b24ab069c2d226744d2c2fff1d9fabaca47b32a2
            invocationIds:
              - 0443fb8a-9bf6-4f52-9b96-cae07463f200
              - 7806fd4d-09aa-4fc1-aba3-55796d50363c
              - 38e34505-cbac-4d39-b1ca-877d3ed81b2f
              - 7e376136-8fa8-4b21-925d-2ea8e596ed0d
              - a32020f0-8ec9-4b75-925f-4cb3e507cc2f
              - 0c7b3b1c-7892-4f59-a060-92213e103bb9
              - 103b0f1b-a167-4005-8093-1f0cc317736c
              - 51fe36e7-8010-4d76-955f-3d902b175bd8
    commit: 2f71de951f9f8244350da5da4aa288d30fcef334
resolution:
  kind: fixed
  reason: Installed CLI candidate selects exact deduplicated Experiment IDs within one Invocation, rejects missing IDs, and passes native reliability takeover netake_SJR99DDVQ28E28WS.
  at: 2026-10-02T07:12:24.862Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/experiment-exact-set-missing.md
    epoch: 0
    validatedAt: 2026-10-02T07:12:19.783Z
    cases:
      - selector: e2e/cli/test/experiment-set.test.ts#neref_6aaf27dac46b66e5b62ee49222d0c257
        caseId: neref_6aaf27dac46b66e5b62ee49222d0c257
        binding:
          kind: direct-contract
          contractRef: docs/feature/experiments/README.md
          contractSha256: 2fdbc58d677acb5ecbb6aaa29dd8d7b7aa66e9c21fbd147857b3d8171f5645ee
        sourceDigest: sha256:b8fdc94a160d22cacb8dc7326d38f0477a6680af3244bf7209eb7b8aad6009e7
        candidateSha256: 09ae81158f5cc3812a95f39f3c643ab3bc7f1532f73553249135138397045c3d
        sourceIdentityDigest: d5379ef9c01f9d111507502bc6178b8790f4f0824f637ed3e4f5c65fb5eddf2d
        red:
          path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/red.json
          digest: sha256:8a819964bce3ce86e7857a387c51ff2188cf3fbca785096db265523f23ba9319
        green:
          path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/green.json
          digest: sha256:2fdfb1a9fdfc5c7ee842b36a483b28af28cb53f0ae4dadcb37e3f68217cca535
        certificate:
          path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/certificate.json
          digest: sha256:86e25ac56a433a469b0d01c04c3d720d46db92548c545d02c5113e56a4ddb289
        inventory:
          path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/inventory.json
          digest: sha256:438b11c1d878d177d0d0c76f34b57ee8910ad3897f9e1a789bb523c6bf9605c5
        reliability:
          - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-1.json
            digest: sha256:39c714a4d95133a6ad75d8926b1ea26e34d57f3e9061fede29f9152f2f978808
          - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-2.json
            digest: sha256:a115384ef8242b1328b9bad880445ff1806b5d49fbeb2c801d9dd4655ac1add8
          - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-3.json
            digest: sha256:b7df4ad558878ee25fad36c96706119ad9d2fbeebddfd68e9bd523af57b0d9b0
          - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-4.json
            digest: sha256:cd99035173f9056afa113f7259f69a2d310a42db16e33a0ba5415ee54233ca8d
          - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-5.json
            digest: sha256:52c0846bc61788a6deb132713971a1715f9ac58ea1d5494afea0c182168d42bc
          - path: e2e/cli/test/experiment-set.test.ts.case-evidence/neref_6aaf27dac46b66e5b62ee49222d0c257/memory_experiment-exact-set-missing.md/nered_4D3N1WH5QHMKQCJ2-netake_SJR99DDVQ28E28WS/reliability-6.json
            digest: sha256:81633fa1514e9e5c0be9db83b24ab069c2d226744d2c2fff1d9fabaca47b32a2
        invocationIds:
          - 0443fb8a-9bf6-4f52-9b96-cae07463f200
          - 7806fd4d-09aa-4fc1-aba3-55796d50363c
          - 38e34505-cbac-4d39-b1ca-877d3ed81b2f
          - 7e376136-8fa8-4b21-925d-2ea8e596ed0d
          - a32020f0-8ec9-4b75-925f-4cb3e507cc2f
          - 0c7b3b1c-7892-4f59-a060-92213e103bb9
          - 103b0f1b-a167-4005-8093-1f0cc317736c
          - 51fe36e7-8010-4d76-955f-3d902b175bd8
---
Experiment CLI 只接受单个路径前缀；离散 ID 集合无法保持精确选择，同时共享一次 Invocation 的预算和全局并发。共同前缀会扩大选择，多个 CLI 进程则各自持有 Invocation 额度。

采用可重复的 --experiment 精确 ID 选项及 Host experimentIds 输入。集合去重，任一缺失 ID 阻断整个计划；后续 Eval 前缀仍只能收窄选中的实验。

公开 CLI 验收选择两个离散实验并重复一个 ID，确认只产生两个 Run、start 声明同一全局并发和精确的 Eval 集合；不存在的精确 ID 不得退回前缀匹配。
