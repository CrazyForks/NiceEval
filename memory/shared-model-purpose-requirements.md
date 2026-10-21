---
format: concord.document/v1
id: shared-model-purpose-requirements
title: 模型用途缺少共享静态要求与加载校验
createdAt: 2026-10-21
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-21T14:26:52.831Z
    action: resolve
    reason: Shared declarations now narrow Adapter eval and usage slots; installed 0.17.1 red and 0.18 candidate reliability matrices validate types and loading behavior.
    resolution:
      kind: fixed
      reason: Shared declarations now narrow Adapter eval and usage slots; installed 0.17.1 red and 0.18 candidate reliability matrices validate types and loading behavior.
      at: 2026-10-21T14:26:52.831Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/shared-model-purpose-requirements.md
        epoch: 0
        validatedAt: 2026-10-21T14:26:49.456Z
        cases:
          - selector: e2e/eval/test/model-slot-types.test.ts#neref_fe19ea53675f32af45a4eb8c2d60ad4c
            caseId: neref_fe19ea53675f32af45a4eb8c2d60ad4c
            binding:
              kind: direct-contract
              contractRef: docs/feature/adapters/README.md
              contractSha256: 95f13a8238635de3ae40e4888efbb985bd593c7b948eeacc02253480a3dd07ca
            sourceDigest: sha256:24da06a9f161f1c13d0058b600b8ba4ac33d6db1f11405d5e64a2e343205d2b1
            candidateSha256: 5c69114b738ffdee986699c6cb33d590a2982f2c9b926dc981ae9b5225f95a6e
            sourceIdentityDigest: 3454554c2402d007db5e606c3063f596903c64a87873ea5be8bbf3cb2c2d84f3
            red:
              path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/red.json
              digest: sha256:7f3993ad6019ba8c541d8bbebb7d5453896dd666f6cb21056a8695bfafca6c85
            green:
              path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/green.json
              digest: sha256:55afd42aaea3faa4b6f9cb04fbce67a1334b28c9f3fcc278e2381c10f6d890c6
            certificate:
              path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/certificate.json
              digest: sha256:e7533b40ac824cb01d9535b41d0619dc80f35781e5d7f199c842f82250ca2607
            inventory:
              path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/inventory.json
              digest: sha256:5d15c6fa6fa29ba612237f9871065c080504257ae34d4bf890849bc15d35450c
            reliability:
              - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-1.json
                digest: sha256:8eac72f92c2aedb15475288da2a87f0bbf13e41ffd890e2340bebc83a799e2b6
              - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-2.json
                digest: sha256:1f22b513f1072dc820f388e5dcace6b40cbba3551bc9d0e71c78e9a17e394927
              - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-3.json
                digest: sha256:dad2a78b5e64471000b3275ea6866fca018de31c0848d26811be0793eedbd6c0
              - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-4.json
                digest: sha256:31e6d2940cf9973e46fd7a6d3e3a09336c6d44d341352a1e733893c33a52aed6
              - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-5.json
                digest: sha256:7841705657b1cb65f466f023bf75db0dc4b4b6492590f8163be8f94a07cefc71
              - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-6.json
                digest: sha256:2cda4b92f2acba784efc15ba3ee1fe54c97181a08f305cdfe50b82cb5dfac6fe
            invocationIds:
              - e394363a-164d-4b71-a170-9e8af9d48226
              - b7ac7452-7b07-43e4-93fb-9fba638f71c7
              - 2e0ed50d-cd47-49a1-900a-30754c7bc1b7
              - 1a1fffd9-c47a-4cf6-bd8e-0aebde03c83d
              - 26a1a500-9469-43fe-ae64-878508e19a09
              - 47fccc45-ca2f-4db5-b6a9-e7dab2923a1d
              - 4653c907-6db3-480a-9cbc-2e8d074c962f
              - feafb11f-eb7b-473b-b595-2a3ac2715ed7
          - selector: e2e/eval/test/required-model-slots.test.ts#neref_702941f37380c45808027cc0012310af
            caseId: neref_702941f37380c45808027cc0012310af
            binding:
              kind: direct-contract
              contractRef: docs/feature/adapters/README.md
              contractSha256: 95f13a8238635de3ae40e4888efbb985bd593c7b948eeacc02253480a3dd07ca
            sourceDigest: sha256:24da06a9f161f1c13d0058b600b8ba4ac33d6db1f11405d5e64a2e343205d2b1
            candidateSha256: 5c69114b738ffdee986699c6cb33d590a2982f2c9b926dc981ae9b5225f95a6e
            sourceIdentityDigest: aed6d3ce90ef1793b910741db3d9f3ec602eeee74bd2ce32f2f3fca8124c715f
            red:
              path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/red.json
              digest: sha256:792efa05bb6e72fc8666e5c502e4f1ef51cc08e91bafc46df8b5d5d4686aac79
            green:
              path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/green.json
              digest: sha256:b0b335cf00b5e83c55b2f786273421a0d1fafc5ba29cd07e9c56c70051337fef
            certificate:
              path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/certificate.json
              digest: sha256:e3894df9d5e02f6d696015c5ba257e555045c6c0a023f13f763f5b03239f3181
            inventory:
              path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/inventory.json
              digest: sha256:5d15c6fa6fa29ba612237f9871065c080504257ae34d4bf890849bc15d35450c
            reliability:
              - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-1.json
                digest: sha256:35ce6deb61738b4c51d8ff98af29f7f319903f2b02dda79e4b1d27e3e14b7abb
              - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-2.json
                digest: sha256:3770b44b1b1674456593d74f8f9b5e54f926bf24af508a5ef873f5d3a24cf190
              - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-3.json
                digest: sha256:0e0123a525c3c6d317c9f9e62659883241c41baa938708d9461de3f0ffd8460c
              - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-4.json
                digest: sha256:c1cb45d0d60d04fa187272294ed51a9689481bb8c90e201f363f85a1dabaa491
              - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-5.json
                digest: sha256:10846d260bdea6d1ef16d793442d6cc6d1c2972362541067305705ea5bf75055
              - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-6.json
                digest: sha256:ebd1f795a44b60fc4dd876bc11d1f680aea7dec2e93a54905998123d1318a034
            invocationIds:
              - 08cc5ef1-75a9-41a9-9e11-ea19a4a7a009
              - 1cb67d78-4841-4a37-85c7-17a834398070
              - 0ba1d2a6-3889-4a7c-8e6a-3d5a1cd7262c
              - 2ecec323-015a-4bce-b653-5874efb275c3
              - 6bcd7930-4cd0-4149-9138-7e4b85d5ecd1
              - 75090f73-430a-42b8-a988-15a64f30f1bd
              - 4cd51645-3fc7-4a89-9b8b-f8f3d8db5e7c
              - 53516dfd-0125-42e9-bcf8-c201cd98fcb8
    commit: 7465ed438263771164ea5dcb5d3f6e50f410d950
resolution:
  kind: fixed
  reason: Shared declarations now narrow Adapter eval and usage slots; installed 0.17.1 red and 0.18 candidate reliability matrices validate types and loading behavior.
  at: 2026-10-21T14:26:52.831Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/shared-model-purpose-requirements.md
    epoch: 0
    validatedAt: 2026-10-21T14:26:49.456Z
    cases:
      - selector: e2e/eval/test/model-slot-types.test.ts#neref_fe19ea53675f32af45a4eb8c2d60ad4c
        caseId: neref_fe19ea53675f32af45a4eb8c2d60ad4c
        binding:
          kind: direct-contract
          contractRef: docs/feature/adapters/README.md
          contractSha256: 95f13a8238635de3ae40e4888efbb985bd593c7b948eeacc02253480a3dd07ca
        sourceDigest: sha256:24da06a9f161f1c13d0058b600b8ba4ac33d6db1f11405d5e64a2e343205d2b1
        candidateSha256: 5c69114b738ffdee986699c6cb33d590a2982f2c9b926dc981ae9b5225f95a6e
        sourceIdentityDigest: 3454554c2402d007db5e606c3063f596903c64a87873ea5be8bbf3cb2c2d84f3
        red:
          path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/red.json
          digest: sha256:7f3993ad6019ba8c541d8bbebb7d5453896dd666f6cb21056a8695bfafca6c85
        green:
          path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/green.json
          digest: sha256:55afd42aaea3faa4b6f9cb04fbce67a1334b28c9f3fcc278e2381c10f6d890c6
        certificate:
          path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/certificate.json
          digest: sha256:e7533b40ac824cb01d9535b41d0619dc80f35781e5d7f199c842f82250ca2607
        inventory:
          path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/inventory.json
          digest: sha256:5d15c6fa6fa29ba612237f9871065c080504257ae34d4bf890849bc15d35450c
        reliability:
          - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-1.json
            digest: sha256:8eac72f92c2aedb15475288da2a87f0bbf13e41ffd890e2340bebc83a799e2b6
          - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-2.json
            digest: sha256:1f22b513f1072dc820f388e5dcace6b40cbba3551bc9d0e71c78e9a17e394927
          - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-3.json
            digest: sha256:dad2a78b5e64471000b3275ea6866fca018de31c0848d26811be0793eedbd6c0
          - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-4.json
            digest: sha256:31e6d2940cf9973e46fd7a6d3e3a09336c6d44d341352a1e733893c33a52aed6
          - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-5.json
            digest: sha256:7841705657b1cb65f466f023bf75db0dc4b4b6492590f8163be8f94a07cefc71
          - path: e2e/eval/test/model-slot-types.test.ts.case-evidence/neref_fe19ea53675f32af45a4eb8c2d60ad4c/memory_shared-model-purpose-requirements.md/nered_G2CB7Z56WCCWY9SS-netake_3H4B5PZK7GMMA0EQ/reliability-6.json
            digest: sha256:2cda4b92f2acba784efc15ba3ee1fe54c97181a08f305cdfe50b82cb5dfac6fe
        invocationIds:
          - e394363a-164d-4b71-a170-9e8af9d48226
          - b7ac7452-7b07-43e4-93fb-9fba638f71c7
          - 2e0ed50d-cd47-49a1-900a-30754c7bc1b7
          - 1a1fffd9-c47a-4cf6-bd8e-0aebde03c83d
          - 26a1a500-9469-43fe-ae64-878508e19a09
          - 47fccc45-ca2f-4db5-b6a9-e7dab2923a1d
          - 4653c907-6db3-480a-9cbc-2e8d074c962f
          - feafb11f-eb7b-473b-b595-2a3ac2715ed7
      - selector: e2e/eval/test/required-model-slots.test.ts#neref_702941f37380c45808027cc0012310af
        caseId: neref_702941f37380c45808027cc0012310af
        binding:
          kind: direct-contract
          contractRef: docs/feature/adapters/README.md
          contractSha256: 95f13a8238635de3ae40e4888efbb985bd593c7b948eeacc02253480a3dd07ca
        sourceDigest: sha256:24da06a9f161f1c13d0058b600b8ba4ac33d6db1f11405d5e64a2e343205d2b1
        candidateSha256: 5c69114b738ffdee986699c6cb33d590a2982f2c9b926dc981ae9b5225f95a6e
        sourceIdentityDigest: aed6d3ce90ef1793b910741db3d9f3ec602eeee74bd2ce32f2f3fca8124c715f
        red:
          path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/red.json
          digest: sha256:792efa05bb6e72fc8666e5c502e4f1ef51cc08e91bafc46df8b5d5d4686aac79
        green:
          path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/green.json
          digest: sha256:b0b335cf00b5e83c55b2f786273421a0d1fafc5ba29cd07e9c56c70051337fef
        certificate:
          path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/certificate.json
          digest: sha256:e3894df9d5e02f6d696015c5ba257e555045c6c0a023f13f763f5b03239f3181
        inventory:
          path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/inventory.json
          digest: sha256:5d15c6fa6fa29ba612237f9871065c080504257ae34d4bf890849bc15d35450c
        reliability:
          - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-1.json
            digest: sha256:35ce6deb61738b4c51d8ff98af29f7f319903f2b02dda79e4b1d27e3e14b7abb
          - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-2.json
            digest: sha256:3770b44b1b1674456593d74f8f9b5e54f926bf24af508a5ef873f5d3a24cf190
          - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-3.json
            digest: sha256:0e0123a525c3c6d317c9f9e62659883241c41baa938708d9461de3f0ffd8460c
          - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-4.json
            digest: sha256:c1cb45d0d60d04fa187272294ed51a9689481bb8c90e201f363f85a1dabaa491
          - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-5.json
            digest: sha256:10846d260bdea6d1ef16d793442d6cc6d1c2972362541067305705ea5bf75055
          - path: e2e/eval/test/required-model-slots.test.ts.case-evidence/neref_702941f37380c45808027cc0012310af/memory_shared-model-purpose-requirements.md/nered_5RVJBG4G4PKMWZT9-netake_ZZF7N6HX85QX8ESX/reliability-6.json
            digest: sha256:ebd1f795a44b60fc4dd876bc11d1f680aea7dec2e93a54905998123d1318a034
        invocationIds:
          - 08cc5ef1-75a9-41a9-9e11-ea19a4a7a009
          - 1cb67d78-4841-4a37-85c7-17a834398070
          - 0ba1d2a6-3889-4a7c-8e6a-3d5a1cd7262c
          - 2ecec323-015a-4bce-b653-5874efb275c3
          - 6bcd7930-4cd0-4149-9138-7e4b85d5ecd1
          - 75090f73-430a-42b8-a988-15a64f30f1bd
          - 4cd51645-3fc7-4a89-9b8b-f8f3d8db5e7c
          - 53516dfd-0125-42e9-bcf8-c201cd98fcb8
---
使用方需要在多个实验间复用同一评估，并让用途名称同时约束缓存判据与 Adapter usage。
0.17.1 只能在调用 rate(slot) 时验证字符串，不能在 TypeScript 阶段拒绝拼写错误；实验也不能在计划前验证所选评估需要的全部用途。
共享模型声明与 Adapter 绑定工厂的 requires.models 是目标契约，见 docs/feature/adapters/library.md。
验收通过安装后的类型消费者与 CLI/SDK 计划入口；过滤条件不能隐藏缺失要求，不创建运行数据库，同一评估可复用于不同模型选择。
