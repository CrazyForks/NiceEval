---
format: concord.document/v1
id: codex-app-server-usage-takes-only-last-response
title: codexAgent 把 app-server 的 tokenUsage.last 当成整轮用量，多请求 send 只记最后一次
createdAt: 2026-10-29
kind: memory
memoryKind: problem
state: resolved
epoch: 0
evidenceRequirement: concord.native-reliability/v1
promotions: []
history:
  - at: 2026-10-29T16:12:26.431Z
    action: resolve
    reason: codexAgent 在一次 send 内按 total 增长逐次累加 last（d92deb892）；修复前候选 c2bc212c0 红灯 nered_CNXNX3Z99WFTBW90，修复候选 takeover 7 项全过 netake_56V1YGW1MRWK2YB7
    resolution:
      kind: fixed
      reason: codexAgent 在一次 send 内按 total 增长逐次累加 last（d92deb892）；修复前候选 c2bc212c0 红灯 nered_CNXNX3Z99WFTBW90，修复候选 takeover 7 项全过 netake_56V1YGW1MRWK2YB7
      at: 2026-10-29T16:12:26.431Z
      epoch: 0
      evidenceLevel: repository
      repositoryEvidence:
        policy: concord.native-reliability/v1
        memory: memory/codex-app-server-usage-takes-only-last-response.md
        epoch: 0
        validatedAt: 2026-10-29T16:12:05.566Z
        cases:
          - selector: e2e/adapter/codex-cli/test/codex-cli.test.ts#neref_199286d0ccc42d91e90b05585572a138
            caseId: neref_199286d0ccc42d91e90b05585572a138
            binding:
              kind: direct-contract
              contractRef: docs/feature/adapters/README.md
              contractSha256: 95f13a8238635de3ae40e4888efbb985bd593c7b948eeacc02253480a3dd07ca
            sourceDigest: sha256:21126c8f7fa1e3906259e0f65c1be4e47d5a58be687bec3ca7da7e3577855c80
            candidateSha256: aef91dbe37e69d800c0c821b14dcc3e7c07f92b3308dc168566f054566b0a7b4
            sourceIdentityDigest: 9cf2533b634e4ee3be6d742ae7744c85b668b997c40ef703c5f547436bd41385
            red:
              path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/red.json
              digest: sha256:1bf9d2869ee02e0d78c1c635e193029b801202f33ba2cb81cafd22c9a53ee30e
            green:
              path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/green.json
              digest: sha256:c11be6a42ff0f47f3628166e203cefaf01be6bd23630d793f079f171189a7de6
            certificate:
              path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/certificate.json
              digest: sha256:d014a58fcc261168fd5c88f06354d216c1b7aa5c94dea05ac16c21d96a79cacf
            inventory:
              path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/inventory.json
              digest: sha256:4bb295a46797d54692bf349c38300c0eacf204d6c513a2a15870c5151e73ee79
            reliability:
              - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-1.json
                digest: sha256:9ca68c97e95a87a8c5da4cd8648a51adb625b2431847b44b8afb946fb29a3ae4
              - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-2.json
                digest: sha256:7fac5eba6c80906bd09033da76eb96ee9719bcc714c26a17d7ae1c729a262708
              - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-3.json
                digest: sha256:ad1f775e8a267fb11894ed3f8762780e5ab3dff47ce60d9277840b1e8fb5af7e
              - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-4.json
                digest: sha256:4f4606839c316455c72f1e05df9c9815f9c919f2267daa913a1b36b5e02ff915
              - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-5.json
                digest: sha256:0582e2704ad55cdb0f11e25027a890770988a85aab30d91c2b6e50b96ec7ad1b
              - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-6.json
                digest: sha256:20fa2b71a219287f511beb32b2e556b1a53972450c8f7bd0a6a202d04c5f0d6d
            invocationIds:
              - 5a86bf8b-f2c2-4ef9-a0d9-dedf6697fddc
              - 0e12255a-7d20-409e-bf41-321ad8cb3947
              - a498a3fe-445d-4000-9775-a2836c1f8dbc
              - 26b0f2f6-4270-4d06-ab0b-36f8fc41e891
              - 7acb4ac6-9300-4ae2-9baa-ca0092917041
              - a136f508-b962-4b0e-b752-38adc073a1b4
              - c4e0161b-5280-4156-9c5e-9b869703725c
              - 73cb5419-8e86-4977-ab43-dbc9539f9a42
    commit: a2a4bd74586bac17ad1158feafbd5e30e81eb35c
resolution:
  kind: fixed
  reason: codexAgent 在一次 send 内按 total 增长逐次累加 last（d92deb892）；修复前候选 c2bc212c0 红灯 nered_CNXNX3Z99WFTBW90，修复候选 takeover 7 项全过 netake_56V1YGW1MRWK2YB7
  at: 2026-10-29T16:12:26.431Z
  epoch: 0
  evidenceLevel: repository
  repositoryEvidence:
    policy: concord.native-reliability/v1
    memory: memory/codex-app-server-usage-takes-only-last-response.md
    epoch: 0
    validatedAt: 2026-10-29T16:12:05.566Z
    cases:
      - selector: e2e/adapter/codex-cli/test/codex-cli.test.ts#neref_199286d0ccc42d91e90b05585572a138
        caseId: neref_199286d0ccc42d91e90b05585572a138
        binding:
          kind: direct-contract
          contractRef: docs/feature/adapters/README.md
          contractSha256: 95f13a8238635de3ae40e4888efbb985bd593c7b948eeacc02253480a3dd07ca
        sourceDigest: sha256:21126c8f7fa1e3906259e0f65c1be4e47d5a58be687bec3ca7da7e3577855c80
        candidateSha256: aef91dbe37e69d800c0c821b14dcc3e7c07f92b3308dc168566f054566b0a7b4
        sourceIdentityDigest: 9cf2533b634e4ee3be6d742ae7744c85b668b997c40ef703c5f547436bd41385
        red:
          path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/red.json
          digest: sha256:1bf9d2869ee02e0d78c1c635e193029b801202f33ba2cb81cafd22c9a53ee30e
        green:
          path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/green.json
          digest: sha256:c11be6a42ff0f47f3628166e203cefaf01be6bd23630d793f079f171189a7de6
        certificate:
          path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/certificate.json
          digest: sha256:d014a58fcc261168fd5c88f06354d216c1b7aa5c94dea05ac16c21d96a79cacf
        inventory:
          path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/inventory.json
          digest: sha256:4bb295a46797d54692bf349c38300c0eacf204d6c513a2a15870c5151e73ee79
        reliability:
          - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-1.json
            digest: sha256:9ca68c97e95a87a8c5da4cd8648a51adb625b2431847b44b8afb946fb29a3ae4
          - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-2.json
            digest: sha256:7fac5eba6c80906bd09033da76eb96ee9719bcc714c26a17d7ae1c729a262708
          - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-3.json
            digest: sha256:ad1f775e8a267fb11894ed3f8762780e5ab3dff47ce60d9277840b1e8fb5af7e
          - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-4.json
            digest: sha256:4f4606839c316455c72f1e05df9c9815f9c919f2267daa913a1b36b5e02ff915
          - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-5.json
            digest: sha256:0582e2704ad55cdb0f11e25027a890770988a85aab30d91c2b6e50b96ec7ad1b
          - path: e2e/adapter/codex-cli/test/codex-cli.test.ts.case-evidence/neref_199286d0ccc42d91e90b05585572a138/memory_codex-app-server-usage-takes-only-last-response.md/nered_CNXNX3Z99WFTBW90-netake_56V1YGW1MRWK2YB7/reliability-6.json
            digest: sha256:20fa2b71a219287f511beb32b2e556b1a53972450c8f7bd0a6a202d04c5f0d6d
        invocationIds:
          - 5a86bf8b-f2c2-4ef9-a0d9-dedf6697fddc
          - 0e12255a-7d20-409e-bf41-321ad8cb3947
          - a498a3fe-445d-4000-9775-a2836c1f8dbc
          - 26b0f2f6-4270-4d06-ab0b-36f8fc41e891
          - 7acb4ac6-9300-4ae2-9baa-ca0092917041
          - a136f508-b962-4b0e-b752-38adc073a1b4
          - c4e0161b-5280-4156-9c5e-9b869703725c
          - 73cb5419-8e86-4977-ab43-dbc9539f9a42
---
## 现象

官方 `codexAgent()` 一轮 send 内有多次工具调用（因而有多次模型请求）时，公开 `attempt.usage` 只有 1 个 request observation，token 只相当于最后一次请求，且 `usage.state = complete`。观察与公开复查见 Issue draft `docs/issues/codex-agent-send-usage-counts-only-last-request.md`。

## 根因

`packages/niceeval/src/agents/codex-app-server.ts` 的 `appServerUsage()` 从后往前找到最后一条 `thread/tokenUsage/updated`，只读取它的 `tokenUsage.last`，并固定 `requests: 1`。旁边注释认为 "`last` is already the current turn's total"。

这个前提是错的。Codex app-server v2 的 `ThreadTokenUsage = { total, last, modelContextWindow }`（codex-cli 0.165.0 `app-server generate-ts` 生成的 `v2/ThreadTokenUsage.ts`）对应 codex-rs 的 `TokenUsageInfo { total_token_usage, last_token_usage }`：每次模型响应完成后，`last` 被替换为该次响应的用量，`total` 在线程级累加。因此 `last` 是最近一次模型请求的用量，`total` 是整个线程的累计值，两者都不是"当前 turn 的合计"。

佐证：下游 Attempt `@1RC9MQT1N4GSM` 一轮内 8 次命令执行，记录的 input 1610 + cache-read 38784 恰好是一个约 40k 上下文的单次请求规模。

现有测试没有覆盖：`e2e/adapter/codex-cli` 的 `usage` Eval 只用单次请求的问答，并且只断言 token 大于 0，单请求与多请求无法区分。

## 修复方向

在 send 窗口（已按 threadId/turnId 过滤的 frames）内，按顺序遍历 `thread/tokenUsage/updated`：`total.totalTokens` 相对上一条严格增长时，视为一次新的模型响应，累加该条的 `last`，并把 requests 计数加一；`total` 未变的重复通知不重复计入。HITL 的 waiting/resume 窗口各自独立计算，不跨窗口重复。

## 验收

在 `e2e/adapter/codex-cli` 的真实 owner 中，让一轮 send 必须经过至少两次工具调用，再断言该轮 `usage.requests` 大于 1。旧候选红、修复后绿。
