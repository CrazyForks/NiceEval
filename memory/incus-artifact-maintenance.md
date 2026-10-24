---
format: concord.document/v1
id: incus-artifact-maintenance
title: Incus artifact 缺少逐对核验、字节准入与两阶段回收
createdAt: 2026-10-24
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-24T07:07:13.416Z
    action: resolve
    reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
    resolution:
      kind: fixed
      reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
      at: 2026-10-24T07:07:13.416Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/incus-artifact-maintenance.md
        epoch: 0
        validatedAt: 2026-10-24T07:06:53.242Z
        cases:
          - selector: e2e/lifecycle/test/incus-artifact-maintenance.test.ts#neref_d2effa6c75c25c8316250b520c2f515f
            caseId: neref_d2effa6c75c25c8316250b520c2f515f
            binding:
              kind: direct-contract
              contractRef: docs/feature/sandbox-nested-docker/README.md
              contractSha256: ec1729bd70fc3ef3603cfbd413f453a26da008509ad7034916aae6682658cd4f
            sourceDigest: sha256:83c1d932130cb9dd05f21292e6dc935b126062455edafbc4c0e8b9714c668a3e
            candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
            sourceIdentityDigest: 058b4dd88e2f15279f33c341165e2acd9df22c9d03e4020b4a0bec287b6a4eef
            red:
              path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/red.json
              digest: sha256:f57e10ee4ee669413a1bb3860b8b22e57789ee11b6f7fe5d08669ddc68bfab8f
            green:
              path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/green.json
              digest: sha256:8e58f8eeeeb33331c20e67e40fbd98b23d7b687ea1b80e37c0b7030644869640
            certificate:
              path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/certificate.json
              digest: sha256:5bf6ed4ae9b1fdb076a6727089065a905cdd1e286a60cfc7379f1fd5433c1db3
            inventory:
              path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/inventory.json
              digest: sha256:98a6b1bc4856b9c1e71872f77661eec5b75903dde3519d77d072bdee2c7f8a87
            reliability:
              - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-1.json
                digest: sha256:6fa8f4a3f69dcc6503f2ccf8571d65498f54591691263c9882c85aefea531e02
              - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-2.json
                digest: sha256:536bfb2f65bfe41d46f41cbb28fa4a87c6c631587000ce542f9702116119634c
              - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-3.json
                digest: sha256:503a2843f6858f35b5bf9714147a4bd462f679c2fa14a4f06ca94d651d670801
              - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-4.json
                digest: sha256:042301feb39f9d1eed040dee68e57f666921f099c7feb2e5a27e988715da1569
              - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-5.json
                digest: sha256:db62d0dcffd8315be7715b1c0b117e64ed0772eb9aa477e24f6f95f6ab146552
              - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-6.json
                digest: sha256:f673c91aaabdcecdfb8081e7e88277e49f53c424d5031cbea51a3e69195aa69a
            invocationIds:
              - 993da589-6bb5-4901-b861-a6bae6c9e9a8
              - c77d42d1-8c22-4cb8-babd-b9e6f2d0dbc1
              - fee77085-eb23-4f1f-8697-0256b88f1877
              - b776b307-c488-420f-880c-12c73bc62800
              - 785b87e8-2421-4470-8dda-c46a9ce7fe4a
              - 4df4b9b4-ce57-4ebc-911a-7aff2ab2b77e
              - b93a3ff9-90af-4209-b803-ba8a06fd84a7
              - cfcf39e9-e365-4f7d-bb0b-ee43a93b8ef0
          - selector: e2e/lifecycle/test/incus-artifact-storage.test.ts#neref_dd86a3872e3fdd76c91f13afbea86468
            caseId: neref_dd86a3872e3fdd76c91f13afbea86468
            binding:
              kind: direct-contract
              contractRef: docs/feature/sandbox-nested-docker/README.md
              contractSha256: ec1729bd70fc3ef3603cfbd413f453a26da008509ad7034916aae6682658cd4f
            sourceDigest: sha256:83c1d932130cb9dd05f21292e6dc935b126062455edafbc4c0e8b9714c668a3e
            candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
            sourceIdentityDigest: 85a74e85be73a32d80f92c42518bc6214017e2d8e5d75fee56e833e5e419440b
            red:
              path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/red.json
              digest: sha256:e92f1b862b207d68b35350471d9d3c70774ef976b2f9d37cc8656d611e3753e6
            green:
              path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/green.json
              digest: sha256:21fde9b8a2faa816da508819be75f1378818ad7d7b44adf0cced66f2dac72074
            certificate:
              path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/certificate.json
              digest: sha256:a1fe75977a744bf93881d9a760249801b6df2f3cb10cf4c8df4ddaba29cefc15
            inventory:
              path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/inventory.json
              digest: sha256:98a6b1bc4856b9c1e71872f77661eec5b75903dde3519d77d072bdee2c7f8a87
            reliability:
              - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-1.json
                digest: sha256:6228f75401f01d1b894a96ecd1deb48e593e7c1c3eee1071e9176439eb72f0e2
              - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-2.json
                digest: sha256:9d8c0cc1ce0d4845b5fe89c89bd0ab6dadfc72b07e134c9707561095a27aaefb
              - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-3.json
                digest: sha256:9cdd315f377320e0e4effe98deac2cf78ebffb2d96454171fceca1d47e9558e5
              - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-4.json
                digest: sha256:d0af6f3115ff68a94344a993411a7b8cee8e0bedc4e6c860e66d9c0828a3f6c3
              - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-5.json
                digest: sha256:4d9606c8c804f487a4c134903baa34c037fd45006459ac77385eda1abed5de4d
              - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-6.json
                digest: sha256:7f2e144557c102b76c66be2b92b62bce2e339b90f01095630fcdd475bc9e08cd
            invocationIds:
              - 6afc9437-afb2-40b0-b117-e2ab3265f5eb
              - c8ebff9a-09a9-441e-bb20-49ad197bf27d
              - eea55ddf-ff04-4a28-bc77-000c4aadb3ca
              - 3bd72f76-2de9-479d-b88a-3248c6957d78
              - 7ecfe8e8-eb64-43a3-b033-05640e9cc293
              - bf0233c4-259d-4d27-b107-20d0e7db6b64
              - 719c4b2c-1d16-47a8-8e29-641ef137c184
              - 24c8e19a-d7d0-46b3-8322-cc9d78255c6a
    commit: b1875255ef08f881816b2ddda3a48d5a0d278701
resolution:
  kind: fixed
  reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
  at: 2026-10-24T07:07:13.416Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/incus-artifact-maintenance.md
    epoch: 0
    validatedAt: 2026-10-24T07:06:53.242Z
    cases:
      - selector: e2e/lifecycle/test/incus-artifact-maintenance.test.ts#neref_d2effa6c75c25c8316250b520c2f515f
        caseId: neref_d2effa6c75c25c8316250b520c2f515f
        binding:
          kind: direct-contract
          contractRef: docs/feature/sandbox-nested-docker/README.md
          contractSha256: ec1729bd70fc3ef3603cfbd413f453a26da008509ad7034916aae6682658cd4f
        sourceDigest: sha256:83c1d932130cb9dd05f21292e6dc935b126062455edafbc4c0e8b9714c668a3e
        candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
        sourceIdentityDigest: 058b4dd88e2f15279f33c341165e2acd9df22c9d03e4020b4a0bec287b6a4eef
        red:
          path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/red.json
          digest: sha256:f57e10ee4ee669413a1bb3860b8b22e57789ee11b6f7fe5d08669ddc68bfab8f
        green:
          path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/green.json
          digest: sha256:8e58f8eeeeb33331c20e67e40fbd98b23d7b687ea1b80e37c0b7030644869640
        certificate:
          path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/certificate.json
          digest: sha256:5bf6ed4ae9b1fdb076a6727089065a905cdd1e286a60cfc7379f1fd5433c1db3
        inventory:
          path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/inventory.json
          digest: sha256:98a6b1bc4856b9c1e71872f77661eec5b75903dde3519d77d072bdee2c7f8a87
        reliability:
          - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-1.json
            digest: sha256:6fa8f4a3f69dcc6503f2ccf8571d65498f54591691263c9882c85aefea531e02
          - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-2.json
            digest: sha256:536bfb2f65bfe41d46f41cbb28fa4a87c6c631587000ce542f9702116119634c
          - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-3.json
            digest: sha256:503a2843f6858f35b5bf9714147a4bd462f679c2fa14a4f06ca94d651d670801
          - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-4.json
            digest: sha256:042301feb39f9d1eed040dee68e57f666921f099c7feb2e5a27e988715da1569
          - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-5.json
            digest: sha256:db62d0dcffd8315be7715b1c0b117e64ed0772eb9aa477e24f6f95f6ab146552
          - path: e2e/lifecycle/test/incus-artifact-maintenance.test.ts.case-evidence/neref_d2effa6c75c25c8316250b520c2f515f/memory_incus-artifact-maintenance.md/nered_0W3XYAX9PVHJQD9E-netake_P6TWVNNAPFG8XBXD/reliability-6.json
            digest: sha256:f673c91aaabdcecdfb8081e7e88277e49f53c424d5031cbea51a3e69195aa69a
        invocationIds:
          - 993da589-6bb5-4901-b861-a6bae6c9e9a8
          - c77d42d1-8c22-4cb8-babd-b9e6f2d0dbc1
          - fee77085-eb23-4f1f-8697-0256b88f1877
          - b776b307-c488-420f-880c-12c73bc62800
          - 785b87e8-2421-4470-8dda-c46a9ce7fe4a
          - 4df4b9b4-ce57-4ebc-911a-7aff2ab2b77e
          - b93a3ff9-90af-4209-b803-ba8a06fd84a7
          - cfcf39e9-e365-4f7d-bb0b-ee43a93b8ef0
      - selector: e2e/lifecycle/test/incus-artifact-storage.test.ts#neref_dd86a3872e3fdd76c91f13afbea86468
        caseId: neref_dd86a3872e3fdd76c91f13afbea86468
        binding:
          kind: direct-contract
          contractRef: docs/feature/sandbox-nested-docker/README.md
          contractSha256: ec1729bd70fc3ef3603cfbd413f453a26da008509ad7034916aae6682658cd4f
        sourceDigest: sha256:83c1d932130cb9dd05f21292e6dc935b126062455edafbc4c0e8b9714c668a3e
        candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
        sourceIdentityDigest: 85a74e85be73a32d80f92c42518bc6214017e2d8e5d75fee56e833e5e419440b
        red:
          path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/red.json
          digest: sha256:e92f1b862b207d68b35350471d9d3c70774ef976b2f9d37cc8656d611e3753e6
        green:
          path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/green.json
          digest: sha256:21fde9b8a2faa816da508819be75f1378818ad7d7b44adf0cced66f2dac72074
        certificate:
          path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/certificate.json
          digest: sha256:a1fe75977a744bf93881d9a760249801b6df2f3cb10cf4c8df4ddaba29cefc15
        inventory:
          path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/inventory.json
          digest: sha256:98a6b1bc4856b9c1e71872f77661eec5b75903dde3519d77d072bdee2c7f8a87
        reliability:
          - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-1.json
            digest: sha256:6228f75401f01d1b894a96ecd1deb48e593e7c1c3eee1071e9176439eb72f0e2
          - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-2.json
            digest: sha256:9d8c0cc1ce0d4845b5fe89c89bd0ab6dadfc72b07e134c9707561095a27aaefb
          - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-3.json
            digest: sha256:9cdd315f377320e0e4effe98deac2cf78ebffb2d96454171fceca1d47e9558e5
          - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-4.json
            digest: sha256:d0af6f3115ff68a94344a993411a7b8cee8e0bedc4e6c860e66d9c0828a3f6c3
          - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-5.json
            digest: sha256:4d9606c8c804f487a4c134903baa34c037fd45006459ac77385eda1abed5de4d
          - path: e2e/lifecycle/test/incus-artifact-storage.test.ts.case-evidence/neref_dd86a3872e3fdd76c91f13afbea86468/memory_incus-artifact-maintenance.md/nered_7CN2Z12PZSMXKQZZ-netake_WHFHJEZTPM6WKWPR/reliability-6.json
            digest: sha256:7f2e144557c102b76c66be2b92b62bce2e339b90f01095630fcdd475bc9e08cd
        invocationIds:
          - 6afc9437-afb2-40b0-b117-e2ab3265f5eb
          - c8ebff9a-09a9-441e-bb20-49ad197bf27d
          - eea55ddf-ff04-4a28-bc77-000c4aadb3ca
          - 3bd72f76-2de9-479d-b88a-3248c6957d78
          - 7ecfe8e8-eb64-43a3-b033-05640e9cc293
          - bf0233c4-259d-4d27-b107-20d0e7db6b64
          - 719c4b2c-1d16-47a8-8e29-641ef137c184
          - 24c8e19a-d7d0-46b3-8322-cc9d78255c6a
---
# 现象

Incus doctor 只验证未登记对象，缺失的 committed instance / volume 会被误报为库存正常。数量配额不能证明 pool 仍有复制空间，公开 CLI 缺少 inventory 与两阶段 GC，失效 intent 持续占用配额。

# 根因与契约

doctor 没有逐对比对 committed intent；capture / consumer copy 没有 pool 字节准入；repository 未持久化成功 lease 时间和 GC 审计。实现依据为 docs/feature/sandbox-nested-docker/cli.md、lifecycle.md 与 architecture.md，设计提交 4f59fcb18。

父验收还发现中断 retirement 的接管缺口：preview 排除全部已有 retirementPlanId 的 intent，claim 也拒绝更换 plan，导致旧 plan 过期或记录失败 outcome 后无法释放容量。新 preview 应重新核对 lease 与现存双对象 metadata，沿用已登记的回收依据；claim 将 retirement owner 纳入证据摘要并原子替换，保留逐对象 absence receipt。旧 preview 无法夺回删除权，旧 outcome 只返回原结果。

# 验证

e2e/lifecycle/test/incus-artifact-maintenance.test.ts 通过安装后 CLI 和隔离 Incus 协议故障端验证 inventory、doctor、预览、实际删除、漂移拒删、lease 变化跳过、absence receipt，以及删除失败后的完整双对象和部分 absence 接管。恢复缺口的正式红灯为 nered_WQPQJ3VNT5Q4RF6X：失败后 fresh preview 错误返回零候选。

e2e/lifecycle/test/incus-artifact-storage.test.ts 的正式红灯为 nered_ZD44EYB8ZNCVRGJB：旧 doctor 在 pool 空间不足时仍成功。两项证据绑定 memory/incus-artifact-maintenance.md 的 epoch 0 和 inventory neinv_67B6A1VWR15YCR42。

修复候选通过上述两项 owner 与 incus-user-database-ledger.test.ts，共 3 项 targeted E2E，cleanup 通过；pnpm typecheck、concord docs check 与 pnpm lint 通过。

## 集成验收

集成候选 SHA-256 为 `51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9`。当前测试 owner 的正式 red、green 与完整 takeover 已由受管命令验证并绑定；takeover 包含独立副本、同目录重复、项目默认并行、清理后重跑及资源清理。

- `e2e/lifecycle/test/incus-artifact-maintenance.test.ts#neref_d2effa6c75c25c8316250b520c2f515f`：inventory `neinv_CKQ3BET33BX9TETS`，red `nered_0W3XYAX9PVHJQD9E`，takeover `netake_P6TWVNNAPFG8XBXD`。
- `e2e/lifecycle/test/incus-artifact-storage.test.ts#neref_dd86a3872e3fdd76c91f13afbea86468`：inventory `neinv_CKQ3BET33BX9TETS`，red `nered_7CN2Z12PZSMXKQZZ`，takeover `netake_WHFHJEZTPM6WKWPR`。

上述刷新 red 使用明确重建的回归候选，不能解释为原历史版本：在最终候选的源码上只恢复相关旧行为，并保留新版公开诊断解码器，以便当前安装后测试能够收集。原历史 red 仍保留在上文。通用重建候选 SHA-256 为 `e4d0756d79c75b4322746909fb345d3785c08b2bb56c3a3ca6289273a01855a6`，源码基点为 `9e02c7304416c93863c88a4dff69d20450e74370`；测试由正式 runner 安装 tarball 后通过公开入口执行，不把 collection 错误计为产品红灯。重建后逐文件核对恢复摘要并重建发布运行时。

维护用例另外使用只恢复“排除已有 retirementPlanId”旧分支的候选（SHA-256 `27e5734ccdfdfa3dca938840670a21fbce41cdb1c2c1469fae304b884fe30123`），保留当前 doctor 输出与公开解码器，确认红灯直接命中中断回收后 fresh preview 无候选；该证据用于最终维护关系。容量用例沿用通用重建候选。

本轮 `pnpm typecheck`、`pnpm test`（146 项）和 `pnpm lint` 通过。未运行真实 Incus/OpenSandbox 服务验收，未清理真实 `/data` 缓存；协议故障端与隔离 Docker 运行结果不代表这些服务的生产验收。
