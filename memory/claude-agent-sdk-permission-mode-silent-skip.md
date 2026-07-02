---
name: claude-agent-sdk-permission-mode-silent-skip
description: "@anthropic-ai/claude-agent-sdk 的 query() 默认 permissionMode 在无终端的 headless 服务里会静默跳过工具调用，模型转而幻觉答案，不报错"
metadata:
  type: project
---

**现象**：`examples/zh/origin/claude-agent-sdk` 改成真实调用 DeepSeek(经 `ANTHROPIC_BASE_URL` 走 anthropic 兼容端点)后，第一次跑「北京天气」返回了一个看起来合理但和 `WEATHER_TABLE` 对不上的假读数(26°C 而不是表里的 24°C，还编了湿度/风力)；问算式时模型直接回复"需要调用计算工具来帮你算，请先授权"，工具调用完全没发生——但请求没有报错，HTTP 200 正常返回。

**根因**：SDK `query()` 的 `options.permissionMode` 默认是 `'default'`，这个模式下每次工具调用都要交互式确认(等终端输入)。这个 demo 是无终端的 `node:http` 服务器，没有 TTY 可以答复这个确认——SDK 不报错、不阻塞，而是让模型收到"工具不可用"的信号，模型于是选择编答案搪塞，从用户能看到的响应看完全是"正常"的一次对话。

**修法**：在 `query()` 的 `options` 里显式设 `permissionMode: "bypassPermissions"`(配合 `allowDangerouslySkipPermissions: true`，具体字段名以当时 SDK 版本 `sdk.d.ts` 为准)。**适用场景边界**：这是一个受控 demo，工具集固定且都是只读/本地计算，全局 bypass 可以接受；如果被测应用会暴露给不可信输入或危险工具(文件写入、shell 执行等)，应该用 `canUseTool` 做按工具的白名单，而不是无脑 bypass——这条本身也是给以后接 claude-agent-sdk 类似 adapter 时的正确默认参照，见 [[docs-otel-mixin-not-implemented]] 里提到的"结构化 SDK message stream，手写 T1 映射成本低"这条路径要用这个例子作为起点。
