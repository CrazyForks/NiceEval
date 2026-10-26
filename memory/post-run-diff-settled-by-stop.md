---
format: concord.document/v1
id: post-run-diff-settled-by-stop
title: 后续 orStop 提前结算工作区归因断言
createdAt: 2026-10-26
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-26T07:53:55.579Z
    action: resolve
    reason: 普通 orStop 仅结算 author 阶段断言；sandbox-result 保留到最终 diff。既有 assertion-sandbox E2E 在旧候选复现红灯，在修复候选通过独立副本、同副本、默认并行与单例完整 takeover。
    resolution:
      kind: fixed
      reason: 普通 orStop 仅结算 author 阶段断言；sandbox-result 保留到最终 diff。既有 assertion-sandbox E2E 在旧候选复现红灯，在修复候选通过独立副本、同副本、默认并行与单例完整 takeover。
      at: 2026-10-26T07:53:55.579Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/post-run-diff-settled-by-stop.md
        epoch: 0
        validatedAt: 2026-10-26T07:53:34.863Z
        cases:
          - selector: e2e/eval/test/assertion-sandbox.test.ts#neref_b261d80355d66158c01ab322627122e3
            caseId: neref_b261d80355d66158c01ab322627122e3
            binding:
              kind: direct-contract
              contractRef: docs/feature/assertions/README.md
              contractSha256: 82525410b1b9399cba8d123d6def4fa83d53b9bdc31d67de29cb10283f4e5e28
            sourceDigest: sha256:52b1d3f4ca33551f9a25852a0942dced2ee3876c6f0f9148b2fd828ace01b47f
            candidateSha256: e72f21d0347a969f6958888e900a7e147070dfd8e387ce7e46bd62861d9c84f5
            sourceIdentityDigest: 0a4c328faab748cd35e4d4d41f1c906a6ea69645f79901d34e491a41daedc9d2
            red:
              path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/red.json
              digest: sha256:6a88dbd1250f59747d22f2713fb8da967d34b0771a5571fc0423c1ceea3e0742
            green:
              path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/green.json
              digest: sha256:af08bcaef1159bac5dfd5d44545c8136257fcf3197f76c7a2b4f57e3e64a99a0
            certificate:
              path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/certificate.json
              digest: sha256:24e36a05aa5d6ff1d5c9e9b68b92a1ab7bafd35836d14fe8dbc41be22ee0fb6d
            inventory:
              path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/inventory.json
              digest: sha256:b69e63b9c37886a141aa010c84670265d245e8f91ece3c8d0c3482b218886fa3
            reliability:
              - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-1.json
                digest: sha256:1b9fe8ff18d95b4a77dc7c627c85a0060eafe8eaf821559ad9debb3fc4724e55
              - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-2.json
                digest: sha256:dd020b1bf9cbf7f218f6c8de44e34a5812539f1249d6de70ac78a00ab22a635f
              - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-3.json
                digest: sha256:cef1432d2e4cdf467c273ea37dbe1b8fb770dcc8144c6b82f768c34b0a712fbe
              - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-4.json
                digest: sha256:c684ffd905b476741441b70224d37a8a59330e60704703d2630849cb4c237bec
              - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-5.json
                digest: sha256:c74af31103202ada1fee78b26b77ea9495181b6c0a8ba4f8d24c3de4f7c10be0
              - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-6.json
                digest: sha256:c6e5f55cbedfe07960cdbfffc11083e847d1b1dcea52cd5bac281657a30a8a4b
            invocationIds:
              - 037ff560-c881-4441-949a-fd15efafd1db
              - 0e4676bb-d129-4ea9-a270-f32d5894e8ea
              - 9dfd9c05-e523-4901-9539-6b0ca9173243
              - ce695ae7-c867-468f-901e-d183aa4b7057
              - 4f3292d6-7d1f-465e-91d4-b197ad001387
              - 8f1d6b86-413a-4850-8f36-0a406920d7e4
              - 0f174d54-a057-420f-9c01-4989104a7a7b
              - 5b707844-1041-4c12-8a00-f9d4042fdee9
    commit: ff22abc59c076823010f3ae1424a92daee6bda5b
resolution:
  kind: fixed
  reason: 普通 orStop 仅结算 author 阶段断言；sandbox-result 保留到最终 diff。既有 assertion-sandbox E2E 在旧候选复现红灯，在修复候选通过独立副本、同副本、默认并行与单例完整 takeover。
  at: 2026-10-26T07:53:55.579Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/post-run-diff-settled-by-stop.md
    epoch: 0
    validatedAt: 2026-10-26T07:53:34.863Z
    cases:
      - selector: e2e/eval/test/assertion-sandbox.test.ts#neref_b261d80355d66158c01ab322627122e3
        caseId: neref_b261d80355d66158c01ab322627122e3
        binding:
          kind: direct-contract
          contractRef: docs/feature/assertions/README.md
          contractSha256: 82525410b1b9399cba8d123d6def4fa83d53b9bdc31d67de29cb10283f4e5e28
        sourceDigest: sha256:52b1d3f4ca33551f9a25852a0942dced2ee3876c6f0f9148b2fd828ace01b47f
        candidateSha256: e72f21d0347a969f6958888e900a7e147070dfd8e387ce7e46bd62861d9c84f5
        sourceIdentityDigest: 0a4c328faab748cd35e4d4d41f1c906a6ea69645f79901d34e491a41daedc9d2
        red:
          path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/red.json
          digest: sha256:6a88dbd1250f59747d22f2713fb8da967d34b0771a5571fc0423c1ceea3e0742
        green:
          path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/green.json
          digest: sha256:af08bcaef1159bac5dfd5d44545c8136257fcf3197f76c7a2b4f57e3e64a99a0
        certificate:
          path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/certificate.json
          digest: sha256:24e36a05aa5d6ff1d5c9e9b68b92a1ab7bafd35836d14fe8dbc41be22ee0fb6d
        inventory:
          path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/inventory.json
          digest: sha256:b69e63b9c37886a141aa010c84670265d245e8f91ece3c8d0c3482b218886fa3
        reliability:
          - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-1.json
            digest: sha256:1b9fe8ff18d95b4a77dc7c627c85a0060eafe8eaf821559ad9debb3fc4724e55
          - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-2.json
            digest: sha256:dd020b1bf9cbf7f218f6c8de44e34a5812539f1249d6de70ac78a00ab22a635f
          - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-3.json
            digest: sha256:cef1432d2e4cdf467c273ea37dbe1b8fb770dcc8144c6b82f768c34b0a712fbe
          - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-4.json
            digest: sha256:c684ffd905b476741441b70224d37a8a59330e60704703d2630849cb4c237bec
          - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-5.json
            digest: sha256:c74af31103202ada1fee78b26b77ea9495181b6c0a8ba4f8d24c3de4f7c10be0
          - path: e2e/eval/test/assertion-sandbox.test.ts.case-evidence/neref_b261d80355d66158c01ab322627122e3/memory_post-run-diff-settled-by-stop.md/nered_HYW63HDH3GJ8N5NA-netake_Y6RY9KG69PR0MTBD/reliability-6.json
            digest: sha256:c6e5f55cbedfe07960cdbfffc11083e847d1b1dcea52cd5bac281657a30a8a4b
        invocationIds:
          - 037ff560-c881-4441-949a-fd15efafd1db
          - 0e4676bb-d129-4ea9-a270-f32d5894e8ea
          - 9dfd9c05-e523-4901-9539-6b0ca9173243
          - ce695ae7-c867-468f-901e-d183aa4b7057
          - 4f3292d6-7d1f-465e-91d4-b197ad001387
          - 8f1d6b86-413a-4850-8f36-0a406920d7e4
          - 0f174d54-a057-420f-9c01-4989104a7a7b
          - 5b707844-1041-4c12-8a00-f9d4042fdee9
---
# 后续 orStop 提前结算 post-run Sandbox Assertion

NiceEval-Eval 的 OpenSandbox 实跑中，changedPaths 在完整 agent send-window diff 已封口后仍为 source-unavailable。公开 diff 只包含允许的 experiments/local.ts；稳定版与 Canary 被测候选均出现，外层运行时是本地 NiceEval 候选。

现有契约规定 Sandbox 归因 Assertion 等作者 settle 后，由共享的冻结 workspace diff 求值；它们不提供 orStop。源码调查发现，后面普通 Assertion 的 orStop 调用 settleThrough，把此前所有 entry（包括 post-run sandbox-result）提前求值并记忆为 unavailable，此时 late.diff 仍 pending。最终 seal 不重新求值，因此与 complete File Changes 不一致。

修复保持已有契约：控制流 barrier 只按登记顺序结算可在作者阶段求值的 entry，sandbox-result 保留到最终 seal；不让 deferred entry 伪装为 unavailable，也不改写历史结果。以已有 Sandbox Assertion Eval owner 加入真实成功 orStop barrier，预期完整归因断言仍使 Eval passed。先取得同一 owner 的安装后候选红灯，再修生产代码并完成接管。
