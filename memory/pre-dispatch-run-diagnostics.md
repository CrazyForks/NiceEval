---
format: concord.document/v1
id: pre-dispatch-run-diagnostics
title: 派发前共享失败缺失 Run 诊断且长错误未注明省略字节数
createdAt: 2026-10-24
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-24T07:05:50.413Z
    action: resolve
    reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
    resolution:
      kind: fixed
      reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
      at: 2026-10-24T07:05:50.413Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/pre-dispatch-run-diagnostics.md
        epoch: 0
        validatedAt: 2026-10-24T07:05:29.582Z
        cases:
          - selector: e2e/cli/test/provider-error-feedback.test.ts#neref_4021142eb40cc28cb6d7b07cf4854390
            caseId: neref_4021142eb40cc28cb6d7b07cf4854390
            binding:
              kind: direct-contract
              contractRef: docs/feature/experiments/README.md
              contractSha256: 8ef308ee7234864efe2ca58900bda0a6bc6c93c83708fff4bf36c495fe0d5534
            sourceDigest: sha256:c64d6a4d3ce91931ff4fbd942e69e9a167a2fdc2746755e1dee6f45ee99122f7
            candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
            sourceIdentityDigest: aff1c0c159248e97e5ef8c9231bf572e852c8f42ce98a030be19300125242041
            red:
              path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/red.json
              digest: sha256:579ce49322d7d037c8dd6eb36785a18eda3bd187ef075da110bb60fc3e4305cc
            green:
              path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/green.json
              digest: sha256:6610008f9980380c845bebaeda5fc86e354b7007e29b0205b10b99e6d272c2ea
            certificate:
              path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/certificate.json
              digest: sha256:6a127d32be5b0dd134d4891a37c3efec3ffcc8ad6d12597a9791eee4e6250d02
            inventory:
              path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/inventory.json
              digest: sha256:ad82e46de37068e89f93e837d1e4e49516e58db79522b1195c15bb4dd8b63975
            reliability:
              - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-1.json
                digest: sha256:348b39db68bb81d73698c8917f9b55a699be3ecea1894b36a03fc9b55784a526
              - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-2.json
                digest: sha256:3fc4ebc45306c5daaae66700327378180a56af59f09eed51ef9d79a66d642688
              - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-3.json
                digest: sha256:d90ad651fe884bc03506bcdf86e67bf4627356f5c2c963120f632b9bafa95c79
              - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-4.json
                digest: sha256:56699eead4893e4a7e32cee7feb86ae89cce3a6edae61fea2f9c66eb3f639887
              - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-5.json
                digest: sha256:5522c2894e3bcdf975b396ad0122b1722e3b5334409c87aa0a9e221f7f892052
              - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-6.json
                digest: sha256:6c222a69219336cb8b6b394d6afdb94f984293929aa9d9a52cd7e08da6e11e20
            invocationIds:
              - f84cae60-bcea-45a5-860f-443646b0b41a
              - b736c029-1d37-491b-b5aa-f0ed6fd5e159
              - b59567f3-e160-4b9c-b428-8b257b00a119
              - c1118efd-75ef-461d-bf77-b9012327cc49
              - d12560bf-aa6b-4942-a110-360fec99d861
              - e86f8531-31ea-4c0b-8976-7b15456c1530
              - 2239dc1f-8ca8-4d62-84e5-4aeb1287581c
              - 3a7693c7-7f7c-4a14-ad0f-b7db43056bc8
          - selector: e2e/insight/test/view-run-diagnostics.browser.spec.ts#neref_5c9f8d2dc0b94f0e538555f50e8fa44e
            caseId: neref_5c9f8d2dc0b94f0e538555f50e8fa44e
            binding:
              kind: direct-contract
              contractRef: docs/feature/insight/use-case/insight-review-run-adoption.md
              contractSha256: 46de0d31998ec31ebc72ac731f6fe750a19dde26b09efcb5bc4183f11cd21baf
            sourceDigest: sha256:d562e2ede0fb9cddaaed4fc4c3ec952d6cdcd89081dbc8daac00bea1cf4158bb
            candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
            sourceIdentityDigest: 5e8bbdba718d56735bd22317b8bd945202e8f27df80e997b82dce21d38f96191
            red:
              path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/red.json
              digest: sha256:ea4c7dfc99154e27932957ad2f4fd32e77e5f57138b74b33e55caa722dbb17bc
            green:
              path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/green.json
              digest: sha256:fa9dd84cd241f19200bb4c35465ac69b64eb85886907ad137be80b3e4ab227a2
            certificate:
              path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/certificate.json
              digest: sha256:fec09ac9f27b940f030c6feb57877f7ef9ee147fc61567aa38de9704b12a298d
            inventory:
              path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/inventory.json
              digest: sha256:8646ab13070ad7802223b5cb799030c3fef90bb3fc498076f574f5fd4934f039
            reliability:
              - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-1.json
                digest: sha256:44aae0cf58064d55c5c1e4590b8d095648cca0d6fe4269c23371dac497ec5f09
              - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-2.json
                digest: sha256:d05b351c3ed57135b97ea923638b55e15e99121129c6e259f80852d76e4b8128
              - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-3.json
                digest: sha256:81f3c2ccdefdbb01cd2e53b8bcd67cf9f2d1f9b505f5e7f50e89bc13d0925a32
              - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-4.json
                digest: sha256:4832a0513d5aefb1ad46e3cb5b81e851c39b5c15d6e4b6feda082b4c8439dd6d
              - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-5.json
                digest: sha256:1e4f5b047c7454fb9bfc9cb44faf7aab39981bc883931675759e2fd215c509fb
              - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-6.json
                digest: sha256:991642da240e9f8a72507db673a73e836059d34e88835085b09c104030dc1458
            invocationIds:
              - e601b5df-f753-47bb-b48c-794caa80b3d7
              - e5abd562-2641-4370-b676-1c4a61c615ec
              - 44eb0a4a-4444-4ed8-bee4-970f3f90e1c1
              - 7c44a74f-1402-413e-9079-fb39ef90e5a7
              - 21e4db9f-3bb6-40b3-8124-9b2a0029d1fb
              - adac9937-e306-4d9a-ad6d-6744cfb6740d
              - 80cab91f-a8a7-48f3-b593-a389b4b1a37a
              - ec808c8e-67f8-4dc5-8ea1-35fd34feb00a
    commit: b1875255ef08f881816b2ddda3a48d5a0d278701
resolution:
  kind: fixed
  reason: Current installed-candidate public E2E red, green, complete takeover and regression relations validate for all linked case owners.
  at: 2026-10-24T07:05:50.413Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/pre-dispatch-run-diagnostics.md
    epoch: 0
    validatedAt: 2026-10-24T07:05:29.582Z
    cases:
      - selector: e2e/cli/test/provider-error-feedback.test.ts#neref_4021142eb40cc28cb6d7b07cf4854390
        caseId: neref_4021142eb40cc28cb6d7b07cf4854390
        binding:
          kind: direct-contract
          contractRef: docs/feature/experiments/README.md
          contractSha256: 8ef308ee7234864efe2ca58900bda0a6bc6c93c83708fff4bf36c495fe0d5534
        sourceDigest: sha256:c64d6a4d3ce91931ff4fbd942e69e9a167a2fdc2746755e1dee6f45ee99122f7
        candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
        sourceIdentityDigest: aff1c0c159248e97e5ef8c9231bf572e852c8f42ce98a030be19300125242041
        red:
          path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/red.json
          digest: sha256:579ce49322d7d037c8dd6eb36785a18eda3bd187ef075da110bb60fc3e4305cc
        green:
          path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/green.json
          digest: sha256:6610008f9980380c845bebaeda5fc86e354b7007e29b0205b10b99e6d272c2ea
        certificate:
          path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/certificate.json
          digest: sha256:6a127d32be5b0dd134d4891a37c3efec3ffcc8ad6d12597a9791eee4e6250d02
        inventory:
          path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/inventory.json
          digest: sha256:ad82e46de37068e89f93e837d1e4e49516e58db79522b1195c15bb4dd8b63975
        reliability:
          - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-1.json
            digest: sha256:348b39db68bb81d73698c8917f9b55a699be3ecea1894b36a03fc9b55784a526
          - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-2.json
            digest: sha256:3fc4ebc45306c5daaae66700327378180a56af59f09eed51ef9d79a66d642688
          - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-3.json
            digest: sha256:d90ad651fe884bc03506bcdf86e67bf4627356f5c2c963120f632b9bafa95c79
          - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-4.json
            digest: sha256:56699eead4893e4a7e32cee7feb86ae89cce3a6edae61fea2f9c66eb3f639887
          - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-5.json
            digest: sha256:5522c2894e3bcdf975b396ad0122b1722e3b5334409c87aa0a9e221f7f892052
          - path: e2e/cli/test/provider-error-feedback.test.ts.case-evidence/neref_4021142eb40cc28cb6d7b07cf4854390/memory_pre-dispatch-run-diagnostics.md/nered_7R3R6D7AFGQWFCDX-netake_9WYCPD7648R5F256/reliability-6.json
            digest: sha256:6c222a69219336cb8b6b394d6afdb94f984293929aa9d9a52cd7e08da6e11e20
        invocationIds:
          - f84cae60-bcea-45a5-860f-443646b0b41a
          - b736c029-1d37-491b-b5aa-f0ed6fd5e159
          - b59567f3-e160-4b9c-b428-8b257b00a119
          - c1118efd-75ef-461d-bf77-b9012327cc49
          - d12560bf-aa6b-4942-a110-360fec99d861
          - e86f8531-31ea-4c0b-8976-7b15456c1530
          - 2239dc1f-8ca8-4d62-84e5-4aeb1287581c
          - 3a7693c7-7f7c-4a14-ad0f-b7db43056bc8
      - selector: e2e/insight/test/view-run-diagnostics.browser.spec.ts#neref_5c9f8d2dc0b94f0e538555f50e8fa44e
        caseId: neref_5c9f8d2dc0b94f0e538555f50e8fa44e
        binding:
          kind: direct-contract
          contractRef: docs/feature/insight/use-case/insight-review-run-adoption.md
          contractSha256: 46de0d31998ec31ebc72ac731f6fe750a19dde26b09efcb5bc4183f11cd21baf
        sourceDigest: sha256:d562e2ede0fb9cddaaed4fc4c3ec952d6cdcd89081dbc8daac00bea1cf4158bb
        candidateSha256: 51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9
        sourceIdentityDigest: 5e8bbdba718d56735bd22317b8bd945202e8f27df80e997b82dce21d38f96191
        red:
          path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/red.json
          digest: sha256:ea4c7dfc99154e27932957ad2f4fd32e77e5f57138b74b33e55caa722dbb17bc
        green:
          path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/green.json
          digest: sha256:fa9dd84cd241f19200bb4c35465ac69b64eb85886907ad137be80b3e4ab227a2
        certificate:
          path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/certificate.json
          digest: sha256:fec09ac9f27b940f030c6feb57877f7ef9ee147fc61567aa38de9704b12a298d
        inventory:
          path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/inventory.json
          digest: sha256:8646ab13070ad7802223b5cb799030c3fef90bb3fc498076f574f5fd4934f039
        reliability:
          - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-1.json
            digest: sha256:44aae0cf58064d55c5c1e4590b8d095648cca0d6fe4269c23371dac497ec5f09
          - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-2.json
            digest: sha256:d05b351c3ed57135b97ea923638b55e15e99121129c6e259f80852d76e4b8128
          - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-3.json
            digest: sha256:81f3c2ccdefdbb01cd2e53b8bcd67cf9f2d1f9b505f5e7f50e89bc13d0925a32
          - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-4.json
            digest: sha256:4832a0513d5aefb1ad46e3cb5b81e851c39b5c15d6e4b6feda082b4c8439dd6d
          - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-5.json
            digest: sha256:1e4f5b047c7454fb9bfc9cb44faf7aab39981bc883931675759e2fd215c509fb
          - path: e2e/insight/test/view-run-diagnostics.browser.spec.ts.case-evidence/neref_5c9f8d2dc0b94f0e538555f50e8fa44e/memory_pre-dispatch-run-diagnostics.md/nered_YY5B3P01428ECZ9K-netake_7772PXVWFDAZ7RS3/reliability-6.json
            digest: sha256:991642da240e9f8a72507db673a73e836059d34e88835085b09c104030dc1458
        invocationIds:
          - e601b5df-f753-47bb-b48c-794caa80b3d7
          - e5abd562-2641-4370-b676-1c4a61c615ec
          - 44eb0a4a-4444-4ed8-bee4-970f3f90e1c1
          - 7c44a74f-1402-413e-9079-fb39ef90e5a7
          - 21e4db9f-3bb6-40b3-8124-9b2a0029d1fb
          - adac9937-e306-4d9a-ad6d-6744cfb6740d
          - 80cab91f-a8a7-48f3-b593-a389b4b1a37a
          - ec808c8e-67f8-4dc5-8ea1-35fd34feb00a
---
# 派发前共享失败的 Run 诊断

GitHub #279。Sandbox setup-prefix 失败进入 failuresByPair 并阻止 Attempt reservation，但没有写入实验诊断累积器；Run-owned niceeval.runner-diagnostics 因而丢失该失败，公开 run.get 也未投影 Run diagnostics。Human 错误文本没有说明省略的字节数。

采用 docs/feature/experiments/cli.md 与 docs/feature/inspection/architecture.md 已定契约：共享失败在 ERRORS 聚合，安全正文保留头尾并注明省略字节数。Run diagnostic receipt 的可选 affectedSlotIds 保存受影响槽位，归一化保留该字段，run.get 映射为 affectedPlannedAttemptIds；show --run 读取同一查询结果。共享 before、setup-prefix、build 失败按 Run 和失败身份去重，不创建 Attempt 或从正文反推槽位。JSON profile 为这些失败输出 diagnostic；其它 warning 语义保持原样。

安装后旧候选的正式 CLI 红灯 nered_E9FY2XY670MERPY6 命中省略字节标记缺失。该轮后续受到 not-started 汇总断言阻断，未执行 Run diagnostics 查询断言，不把它计作诊断查询的独立红灯证据。CLI fixture 必须在 prefix 实验显式配置 sandboxCache.before 为 use，覆盖测试项目的 bypass；否则错误发生于真实 Attempt 创建后，无法覆盖派发前路径。

修复候选 sha256:6f9e7e7eb0d47136161ecbdc6ad293e0a95c375788f0a143915bc942de5a3ca6 的 provider-error-feedback CLI 切片已通过：before、build、setup-prefix 持久诊断，关联槽位、show 人读内容、JSON diagnostic 事件和资源回收均通过。

## 集成验收

集成候选 SHA-256 为 `51ec09ed246c8478cad4eecb8b5a9f7cfefde02043dab722c9c6b3a2b9988bc9`。当前测试 owner 的正式 red、green 与完整 takeover 已由受管命令验证并绑定；takeover 包含独立副本、同目录重复、项目默认并行、清理后重跑及资源清理。

- `e2e/cli/test/provider-error-feedback.test.ts#neref_4021142eb40cc28cb6d7b07cf4854390`：inventory `neinv_W9T6CED8A8DMTRN2`，red `nered_7R3R6D7AFGQWFCDX`，takeover `netake_9WYCPD7648R5F256`。
- `e2e/insight/test/view-run-diagnostics.browser.spec.ts#neref_5c9f8d2dc0b94f0e538555f50e8fa44e`：inventory `neinv_TWCTCY8NB81ZJV37`，red `nered_YY5B3P01428ECZ9K`，takeover `netake_7772PXVWFDAZ7RS3`。

上述刷新 red 使用明确重建的回归候选，不能解释为原历史版本：在最终候选的源码上只恢复相关旧行为，并保留新版公开诊断解码器，以便当前安装后测试能够收集。原历史 red 仍保留在上文。通用重建候选 SHA-256 为 `e4d0756d79c75b4322746909fb345d3785c08b2bb56c3a3ca6289273a01855a6`，源码基点为 `9e02c7304416c93863c88a4dff69d20450e74370`；测试由正式 runner 安装 tarball 后通过公开入口执行，不把 collection 错误计为产品红灯。重建后逐文件核对恢复摘要并重建发布运行时。

Insight 同时包含 Vitest 与 Playwright。浏览器 takeover 必须追加 `-- --config playwright.config.ts`，让不带文件 selector 的默认并行轮进入 Playwright；只传 reporter 参数会误入 Vitest 并因报告缺少 suites 被拒绝。该次失败不算浏览器证书；其 4 项 Vitest 运行单独通过，最终浏览器证据覆盖完整 Playwright suite。

本轮 `pnpm typecheck`、`pnpm test`（146 项）和 `pnpm lint` 通过。未运行真实 Incus/OpenSandbox 服务验收，未清理真实 `/data` 缓存；协议故障端与隔离 Docker 运行结果不代表这些服务的生产验收。
