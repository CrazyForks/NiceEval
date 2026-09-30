---
format: concord.document/v1
id: inspection-complete-failed-scores
title: Inspection 总分遗漏失败但完整的评分
createdAt: 2026-09-30
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-09-30T10:12:33.110Z
    action: resolve
    reason: 安装候选的公开浏览器入口已通过完整七次可靠性验收，failed Verdict 的完整分数和零分均保留；正式回归关系已登记并核对。
    resolution:
      kind: fixed
      reason: 安装候选的公开浏览器入口已通过完整七次可靠性验收，failed Verdict 的完整分数和零分均保留；正式回归关系已登记并核对。
      at: 2026-09-30T10:12:33.110Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/inspection-complete-failed-scores.md
        epoch: 0
        validatedAt: 2026-09-30T10:12:29.532Z
        cases:
          - selector: e2e/insight/test/view-snapshot.browser.spec.ts#neref_b837639ed5650fdfbc1c8e0680cf3b4a
            caseId: neref_b837639ed5650fdfbc1c8e0680cf3b4a
            binding:
              kind: direct-contract
              contractRef: docs/feature/insight/use-case/insight-review-run-adoption.md
              contractSha256: 1850c482a748f291442409cda7093629fc08976ab65dda0b9eb621d8ac7a932a
            sourceDigest: sha256:a5474e39db39a906ed1567a87d2c1436221e7981ad5a168856002317674613b7
            candidateSha256: b65a4ebeaa9eaa014c219a2783f9effd8f17e5d733592d67a9492a79ad859c08
            sourceIdentityDigest: 9a2f3d38cea46f1ac4447409c046fc3e2f70c09aae3035513526643bd988c370
            red:
              path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/red.json
              digest: sha256:20a2049cf7d2cc3b08b62586614334def89725504b18ce00d4add28d3d19c6c3
            green:
              path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/green.json
              digest: sha256:d0f0a76dcd5e2ff8860cd57a4ae1ac6194938f9f617bf72ff82bf67d554d99f8
            certificate:
              path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/certificate.json
              digest: sha256:dde92e7a20f7c449a59680a194e47f572781bc1cdb13e2720944b843bb8fd1ff
            inventory:
              path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/inventory.json
              digest: sha256:53d51635c11222133f206ad44604d6cbe9fcaf9a665c02390e57d56fb3bb3100
            reliability:
              - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-1.json
                digest: sha256:ef6d0c78c50ce8676be23fca81b4194900198924c942c7f4aaacf2a197b506a4
              - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-2.json
                digest: sha256:98e5cdcf7abaca56a870fe89ffc8f374299a885f579c11899504d8b8753f36a1
              - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-3.json
                digest: sha256:df8034e4d77328e738d4d28966a669f2f2169efb1f9ad3cca0e900767152b6c5
              - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-4.json
                digest: sha256:9ef9db1a090cdea80cec77b1b0f60feca619e615cb0c697e84087e73df798de1
              - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-5.json
                digest: sha256:3fd762a6b9ec513f63441615f3701d585d02888a4a66fc77f969c6a624bc949a
              - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-6.json
                digest: sha256:bbccc91aa916a9d2d003b89c0c821e582a7576b429b18c76a317e1c16977ca51
            invocationIds:
              - 5711cd3f-b981-4c8f-9134-181bcde5fa04
              - 1677869f-d6a6-48c3-b830-b3c0783dbc05
              - 023790d6-6a76-4a00-a2f4-4f6fdb8c44e1
              - a768a1d8-dbae-4bf8-94b9-ac408f58a77e
              - 108681ba-ced4-47d3-b5b9-18d61193ac05
              - 71249d2f-2703-48c7-9919-699a0fd99cfe
              - 6a5feb8d-bcdc-43fe-9f0b-c8d987dcf2a8
              - a8bfe2b7-9e45-4a9f-a71c-04d9778cc8d8
    commit: 7ad457dcd4867bf3fe3c38715d7a2d13507bb05b
resolution:
  kind: fixed
  reason: 安装候选的公开浏览器入口已通过完整七次可靠性验收，failed Verdict 的完整分数和零分均保留；正式回归关系已登记并核对。
  at: 2026-09-30T10:12:33.110Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/inspection-complete-failed-scores.md
    epoch: 0
    validatedAt: 2026-09-30T10:12:29.532Z
    cases:
      - selector: e2e/insight/test/view-snapshot.browser.spec.ts#neref_b837639ed5650fdfbc1c8e0680cf3b4a
        caseId: neref_b837639ed5650fdfbc1c8e0680cf3b4a
        binding:
          kind: direct-contract
          contractRef: docs/feature/insight/use-case/insight-review-run-adoption.md
          contractSha256: 1850c482a748f291442409cda7093629fc08976ab65dda0b9eb621d8ac7a932a
        sourceDigest: sha256:a5474e39db39a906ed1567a87d2c1436221e7981ad5a168856002317674613b7
        candidateSha256: b65a4ebeaa9eaa014c219a2783f9effd8f17e5d733592d67a9492a79ad859c08
        sourceIdentityDigest: 9a2f3d38cea46f1ac4447409c046fc3e2f70c09aae3035513526643bd988c370
        red:
          path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/red.json
          digest: sha256:20a2049cf7d2cc3b08b62586614334def89725504b18ce00d4add28d3d19c6c3
        green:
          path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/green.json
          digest: sha256:d0f0a76dcd5e2ff8860cd57a4ae1ac6194938f9f617bf72ff82bf67d554d99f8
        certificate:
          path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/certificate.json
          digest: sha256:dde92e7a20f7c449a59680a194e47f572781bc1cdb13e2720944b843bb8fd1ff
        inventory:
          path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/inventory.json
          digest: sha256:53d51635c11222133f206ad44604d6cbe9fcaf9a665c02390e57d56fb3bb3100
        reliability:
          - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-1.json
            digest: sha256:ef6d0c78c50ce8676be23fca81b4194900198924c942c7f4aaacf2a197b506a4
          - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-2.json
            digest: sha256:98e5cdcf7abaca56a870fe89ffc8f374299a885f579c11899504d8b8753f36a1
          - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-3.json
            digest: sha256:df8034e4d77328e738d4d28966a669f2f2169efb1f9ad3cca0e900767152b6c5
          - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-4.json
            digest: sha256:9ef9db1a090cdea80cec77b1b0f60feca619e615cb0c697e84087e73df798de1
          - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-5.json
            digest: sha256:3fd762a6b9ec513f63441615f3701d585d02888a4a66fc77f969c6a624bc949a
          - path: e2e/insight/test/view-snapshot.browser.spec.ts.case-evidence/neref_b837639ed5650fdfbc1c8e0680cf3b4a/memory_inspection-complete-failed-scores.md/nered_SN9A4TR2KJQ54PRM-netake_3H1EKFJ4F6F7JP02/reliability-6.json
            digest: sha256:bbccc91aa916a9d2d003b89c0c821e582a7576b429b18c76a317e1c16977ca51
        invocationIds:
          - 5711cd3f-b981-4c8f-9134-181bcde5fa04
          - 1677869f-d6a6-48c3-b830-b3c0783dbc05
          - 023790d6-6a76-4a00-a2f4-4f6fdb8c44e1
          - a768a1d8-dbae-4bf8-94b9-ac408f58a77e
          - 108681ba-ced4-47d3-b5b9-18d61193ac05
          - 71249d2f-2703-48c7-9919-699a0fd99cfe
          - 6a5feb8d-bcdc-43fe-9f0b-c8d987dcf2a8
          - a8bfe2b7-9e45-4a9f-a71c-04d9778cc8d8
---
# 现象与边界

消费者在公开 run.summary 与 attempt.get 读到 failed 且 score.state=complete 的评分，Insight 总分与完整性却忽略这些结果；完整的零分也显示不可用。失败判定与评分完整性须分别保留。

# 已核对的根因

inspection/overview.ts 的 scoreForCell 使用 verdict === passed 作为完整评分样本条件，scoreForMember 则保留 failed 的完整分数。普通总分与完整性因此相互矛盾。成功排名标签不是分数可用性的判据。

# 验收

通过公开安装候选的 Inspection 与 Insight 读取 failed+complete 的非零及零分，核对同一分母、总分及完整性；partial/unavailable 不补零，verdict 不改写。正式红绿与可靠性证据取得前保持开放。
