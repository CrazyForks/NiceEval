// fasteval 内置 agent 列表。CLI 在构建注册表时先放这些,用户 config.agents 里同名的覆盖。
// 这样「--agent claude-code」开箱即用;想自定义同名 agent 时直接在 config 里写同名 agent 覆盖。

import claudeCode from "./claude-code.ts";
import codex from "./codex.ts";
import bub from "./bub.ts";
import type { Agent } from "../types.ts";

export const BUILTIN_AGENTS: readonly Agent[] = [claudeCode, codex, bub];
