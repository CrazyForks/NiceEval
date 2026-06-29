<div align="center">

# Fast Eval

**渐进式、全功能、DX优秀的轻量 agent evals 工具**

[![typescript](https://img.shields.io/badge/typescript-5.6-blue?style=flat-square)](tsconfig.json)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](package.json)
[![docs](https://img.shields.io/badge/docs-readable-111827?style=flat-square)](docs/README.md)

[English](README.md) 

</div>

fasteval 是一个受[eve](eve.dev)启发的通用型 agent eval 工具。首先有非常优秀的 DX 设计，任何人可以在 10 分钟左右上手并配置。并且设计非常的通用。即可以用来 eval 给 Claude Code/Codex 写的 coding agent 的插件、Hook还有Skill。更可以直接 eval 自己的 AI Agent 框架(无论是基于 AI SDK、LangGraph、Pi还是什么接口都可以轻松接入)。

在 eval 完成之后可以生成易读的报告与查看 Agent 的行为细节。方便 Debug 与优化。

## 架构

```text
              evals/*.eval.ts
                    │
                    ▼
   ┌───────────────────────────────────────────┐
   │                fasteval 核心                │
   │     发现 → 调度 → 打分 → 报告 → Artifacts    │
   └───────────────────────────────────────────┘
          │                            │
          │ Agent 适配器边界            │ Sandbox 后端
          ▼                            ▼
   ┌─────────────────────────┐   ┌──────────────┐
   │ Codex / Claude Code /   │   │    Docker    │
   │ 你自己的 AI Agent 框架   │   │  (隔离工作区) │
   │ (AI SDK·LangGraph·Pi…)  │   └──────────────┘
   └─────────────────────────┘
                    │
                    ▼
   verdicts · traces · costs · diffs · transcripts · artifacts
```

- **fasteval 核心** 负责发现 eval、调度运行、打分、生成报告与 artifacts。
- **Agent 适配器** 是开放的边界：你来决定如何调用被测系统——Codex、Claude Code，或你自己的 AI Agent 框架（AI SDK / LangGraph / Pi 等）都可以轻松接入。
- **Sandbox 后端** 决定隔离工作在哪里运行；Docker 是当前实现，其它后端可以放在同一接口之后。


## Usage

```ts
// evals/button.eval.ts
import { defineEval } from "fasteval";
import { includes } from "fasteval/expect";

export default defineEval({
  description: "实现一个带 label 和 onClick props 的 Button 组件。",
  workspace: "fixtures/button",
  async test(t) {
    await t.send("创建 src/components/Button.tsx，支持 label 和 onClick props。");

    t.succeeded();
    t.fileChanged("src/components/Button.tsx");
    t.check(t.file("src/components/Button.tsx"), includes("onClick"));
    t.testsPassed();
  },
});
```

```sh
npx fasteval button --agent codex --sandbox docker
npx fasteval view
```

## 快速开始

Copy to your agent
```
READ xxxx and install fasteval for this repo.
```

## 文档

- [文档首页](docs/README.md)
- [Getting Started](docs/getting-started.md)
- [Authoring](docs/authoring.md)
- [Scoring](docs/scoring.md)
- [Agents and Adapters](docs/agents-and-adapters.md)
- [Sandbox](docs/sandbox.md)
- [Runner](docs/runner.md)
- [Experiments](docs/experiments.md)
- [Observability](docs/observability.md)
- [CLI](docs/cli.md)
- [Source Map](docs/source-map.md)
