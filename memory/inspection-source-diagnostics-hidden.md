---
format: concord.document/v1
id: inspection-source-diagnostics-hidden
title: Inspection 读取错误丢失实际分类并统一提示旧版本
createdAt: 2026-09-30
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-09-30T08:55:23.456Z
    action: resolve
    reason: Public CLI preserves the actual Record error code, operation and reason; resource/busy failures no longer claim old or corrupt data. Managed old-candidate red and final-candidate reliability passed. This does not resolve the separate transient-source problem.
    resolution:
      kind: fixed
      reason: Public CLI preserves the actual Record error code, operation and reason; resource/busy failures no longer claim old or corrupt data. Managed old-candidate red and final-candidate reliability passed. This does not resolve the separate transient-source problem.
      at: 2026-09-30T08:55:23.456Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/inspection-source-diagnostics-hidden.md
        epoch: 0
        validatedAt: 2026-09-30T08:55:19.878Z
        cases:
          - selector: e2e/inspection/test/source-diagnostics.test.ts#neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01
            caseId: neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01
            binding:
              kind: direct-contract
              contractRef: docs/feature/inspection/README.md
              contractSha256: 162064d5282f0f2a7197aeffd1c68c359a7d54de762768c73adb7fc0f89c4a09
            sourceDigest: sha256:53a56a965a19fec2d7a05b4400994def794f7aaacc7a007e227aaffeb4b899d8
            candidateSha256: 1ff09947744bffe3d5e99be243809acbc8c32a5df22ac295a13f71851883d9ae
            sourceIdentityDigest: c88f09e10c3b60b53ac72064f597bed4d4e72c7fdf1652456911644f3d9a253e
            red:
              path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/red.json
              digest: sha256:429d7b9327e9b3036988e87634ddb29b16fc341d8f252be73217ac554b7065d9
            green:
              path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/green.json
              digest: sha256:c6b5215d987c3133a1854ed18d1c497785eb07631e8a7c82bb098da450cd33ef
            certificate:
              path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/certificate.json
              digest: sha256:ec1339af3911447b1bb247072e6bd8f2a985cceb9739fe0fda49cbfd804c72e5
            inventory:
              path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/inventory.json
              digest: sha256:84812cffb13b224a83bb63855bed2abdad380ec81d6cbb588e21bd0ee1940207
            reliability:
              - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-1.json
                digest: sha256:5d2af24938351ee32003c2d091e792d94b051fb8f988931bd1cafceaa623643c
              - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-2.json
                digest: sha256:02cbbfe771320dd02e46b606756d48229f1fb49e73c5b868ecfaf8e5134c6f14
              - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-3.json
                digest: sha256:ad78010f3fbbb296611636ff76f43cccaa845a8eb922cf4383d0d7ae3d42a227
              - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-4.json
                digest: sha256:06d4f975aa5b2ecd7d58a2c61669acb1612535432a2776b83de90e7ab3e9631c
              - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-5.json
                digest: sha256:24d25bf303028d353e55dc6a89f6d58d209a92fbaf6f28ff3e6601c402f5564f
              - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-6.json
                digest: sha256:eff0bdee7ec5cbcd17603d92f9cca94dc16ce9930c30c323444fede8d2557cd2
            invocationIds:
              - 80b24435-2107-4cb8-948e-a0c3aa25b44b
              - 9bbe8f3c-7d6f-4a80-88b5-1c05f5e25edd
              - 83b028fb-73f0-4476-bb49-72611ebe9c8c
              - 6f27fbe8-cc22-45d8-841c-1c881f66f1f8
              - 37131842-9c7e-4720-8d37-10535a506fc7
              - 061257f4-17a3-470b-a681-f19100dab43c
              - f4d2263a-80d2-4790-bb17-eca1f90773d2
              - 578ef8cb-bb45-4db2-ad10-eefcad85f619
    commit: 7ad457dcd4867bf3fe3c38715d7a2d13507bb05b
resolution:
  kind: fixed
  reason: Public CLI preserves the actual Record error code, operation and reason; resource/busy failures no longer claim old or corrupt data. Managed old-candidate red and final-candidate reliability passed. This does not resolve the separate transient-source problem.
  at: 2026-09-30T08:55:23.456Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/inspection-source-diagnostics-hidden.md
    epoch: 0
    validatedAt: 2026-09-30T08:55:19.878Z
    cases:
      - selector: e2e/inspection/test/source-diagnostics.test.ts#neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01
        caseId: neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01
        binding:
          kind: direct-contract
          contractRef: docs/feature/inspection/README.md
          contractSha256: 162064d5282f0f2a7197aeffd1c68c359a7d54de762768c73adb7fc0f89c4a09
        sourceDigest: sha256:53a56a965a19fec2d7a05b4400994def794f7aaacc7a007e227aaffeb4b899d8
        candidateSha256: 1ff09947744bffe3d5e99be243809acbc8c32a5df22ac295a13f71851883d9ae
        sourceIdentityDigest: c88f09e10c3b60b53ac72064f597bed4d4e72c7fdf1652456911644f3d9a253e
        red:
          path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/red.json
          digest: sha256:429d7b9327e9b3036988e87634ddb29b16fc341d8f252be73217ac554b7065d9
        green:
          path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/green.json
          digest: sha256:c6b5215d987c3133a1854ed18d1c497785eb07631e8a7c82bb098da450cd33ef
        certificate:
          path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/certificate.json
          digest: sha256:ec1339af3911447b1bb247072e6bd8f2a985cceb9739fe0fda49cbfd804c72e5
        inventory:
          path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/inventory.json
          digest: sha256:84812cffb13b224a83bb63855bed2abdad380ec81d6cbb588e21bd0ee1940207
        reliability:
          - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-1.json
            digest: sha256:5d2af24938351ee32003c2d091e792d94b051fb8f988931bd1cafceaa623643c
          - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-2.json
            digest: sha256:02cbbfe771320dd02e46b606756d48229f1fb49e73c5b868ecfaf8e5134c6f14
          - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-3.json
            digest: sha256:ad78010f3fbbb296611636ff76f43cccaa845a8eb922cf4383d0d7ae3d42a227
          - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-4.json
            digest: sha256:06d4f975aa5b2ecd7d58a2c61669acb1612535432a2776b83de90e7ab3e9631c
          - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-5.json
            digest: sha256:24d25bf303028d353e55dc6a89f6d58d209a92fbaf6f28ff3e6601c402f5564f
          - path: e2e/inspection/test/source-diagnostics.test.ts.case-evidence/neref_2ecb4cd1cc4eaffd80a33a3a3a9a6a01/memory_inspection-source-diagnostics-hidden.md/nered_9DTZ1GD39VK7VG5X-netake_QYA0QZ2D044AT1KR/reliability-6.json
            digest: sha256:eff0bdee7ec5cbcd17603d92f9cca94dc16ce9930c30c323444fede8d2557cd2
        invocationIds:
          - 80b24435-2107-4cb8-948e-a0c3aa25b44b
          - 9bbe8f3c-7d6f-4a80-88b5-1c05f5e25edd
          - 83b028fb-73f0-4476-bb49-72611ebe9c8c
          - 6f27fbe8-cc22-45d8-841c-1c881f66f1f8
          - 37131842-9c7e-4720-8d37-10535a506fc7
          - 061257f4-17a3-470b-a681-f19100dab43c
          - f4d2263a-80d2-4790-bb17-eca1f90773d2
          - 578ef8cb-bb45-4db2-ad10-eefcad85f619
---
# 现象与根因

CLI 把所有 InspectionSourceError 改写成同一句旧版本迁移提示，丢失底层错误分类与原因。损坏输入、资源上限、忙碌读取因此无法区分；消费者无法从公开 JSON 继续诊断偶发失败。

# 契约与范围

读取错误保留具名的 Record 错误分类、操作与原因。只有明确的 schema migration required 才给迁移建议。资源限额和 busy 属于未完成读取，不宣称 Record 损坏；已确认的完整性失败仍保持原分类。此修正不证明 RPG 偶发读取失败的根因，后者继续由 inspection-transient-source-invalid 跟进。

# 验收

安装候选公开 query 对无效 Record 和输入尺寸限制给出可区分诊断，原文件不改写，不调用模型。正式回归证据完成前保持开放。
