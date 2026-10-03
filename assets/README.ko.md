<div align="center">

# NiceEval

**단위 테스트처럼 평가를 작성하고, 실험처럼 Agent를 비교하세요**

[![typescript](https://img.shields.io/badge/typescript-5.6-blue?style=flat-square)](../packages/niceeval/tsconfig.json)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../package.json)
[![docs](https://img.shields.io/badge/docs-niceeval.com-111827?style=flat-square)](https://niceeval.com/docs/introduction)
[![discord](https://img.shields.io/badge/discord-join%20chat-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/yTMdZjFFJ)

[English](../README.md) | [中文](../README.zh.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [français](README.fr.md) | [日本語](README.ja.md) | [Português](README.pt.md) | [Русский](README.ru.md)

</div>

프롬프트를 수정하거나 모델을 바꾸고, Claude Code용 Skill을 새로 작성하거나 게임 NPC의 프롬프트를 조정했습니다. 정말 더 좋아졌을까요?

대부분은 몇 번 직접 실행해 보고 감으로 판단합니다. 하지만 LLM의 출력은 불확실합니다. 같은 질문에 이번에는 맞게 답하고 다음에는 틀릴 수 있습니다. 세 번 모두 성공했다고 해서 변경이 효과적이거나 다른 부분을 망가뜨리지 않았다는 뜻은 아닙니다.

NiceEval은 감 대신 근거로 판단하게 해 줍니다. Agent가 주요 대상이지만 LLM 기반 애플리케이션이라면 무엇이든 평가할 수 있습니다. 어떤 도구를 호출해야 하는지, 답변에 무엇이 있어야 하는지, 코드를 수정한 뒤 테스트가 통과하는지, 상호작용 후에도 게임 세계의 일관성이 유지되는지 등 ‘올바른 결과’를 TypeScript로 작성합니다. NiceEval은 평가 대상에 연결해 반복 실행하고 점수를 매깁니다. 각 실행의 대화, 도구 호출, 파일 변경, 소요 시간과 비용을 기록해 비교하고 추적할 수 있게 합니다.

작성 방식은 단위 테스트와 비슷하고, 활용 방식은 실험에 가깝습니다.

- **회귀 방지**: 프롬프트 변경, 모델 교체, 의존성 업그레이드 후 같은 평가를 다시 실행해 통과율이 떨어지는지 확인합니다.
- **비교**: 같은 평가를 두 모델, 두 프롬프트 버전, Skill 설치 전후로 실행합니다. 차이를 수치와 개별 기록에서 확인합니다.
- **CI 통합**: 점수가 기준보다 낮으면 변경을 차단합니다.
- **커버리지 확대**: 실제 사용에서 드러난 실패를 새 평가로 추가하면 이후의 모든 변경에서 확인할 수 있습니다.

모든 실행은 자신의 컴퓨터와 CI에서 이루어집니다. 계정 가입은 필요 없습니다.

## 예제

날씨 도우미를 검증합니다. 날씨를 물으면 답을 지어내는 대신 실제로 `get_weather`를 호출해야 합니다.

```ts
// evals/weather-tool.eval.ts
import { defineEval, defineJudge } from "niceeval";
import { includes, jsonMatch, pattern, toolMatch } from "niceeval/expect";

const groundedAnswer = defineJudge({
  name: "grounded-weather-answer",
  rubric: "Does the assistant answer using the tool's weather data rather than refusing or being vague?",
});

export default defineEval({
  description: "Call the weather tool and answer using its result",
  judge: groundedAnswer,

  async test(t) {
    const turn = await t.send("What's the weather in Beijing today?");
    turn.succeeded();

    // Check deterministic facts with deterministic rules
    turn.calledTool(toolMatch("get_weather", { input: jsonMatch({ city: "Beijing" }) }));
    t.check(turn.message, pattern(/°C|temperature|sunny|cloudy|rain/));

    // The second turn should retain the context
    const second = await t.send("What about Shanghai tomorrow?");
    t.check(second.message, includes("Shanghai"));

    // Let a judge model assess open-ended quality
    t.judge({ question: turn.input, answer: turn.message }, groundedAnswer).gate(0.7);
  },
});
```

어떤 Agent를 어떤 모델로 실행할지는 평가 케이스와 분리된 Experiment에 작성합니다. 따라서 같은 케이스로 두 모델이나 두 프롬프트 버전을 바로 비교할 수 있습니다.

```ts
// experiments/local.ts
import { defineExperiment } from "niceeval";
import { webAgent } from "../agents/web-agent"; // Your own Adapter, a few dozen lines

export default defineExperiment({
  agent: webAgent({ baseUrl: "http://127.0.0.1:5188" }),
  model: "gpt-5.5",
});
```

```sh
pnpm exec niceeval exp local weather-tool   # Run only weather-tool with the local experiment
pnpm exec niceeval show                     # See results in the terminal, failures first
pnpm exec niceeval view                     # Browse conversations and tool calls in the browser
```

완전히 실행 가능한 프로젝트는 [`examples/zh/ai-sdk/`](../examples/zh/ai-sdk/)에 있습니다.

## 무엇을 평가할 수 있나요?

**직접 만든 AI 애플리케이션.** AI SDK, LangGraph, Pi 또는 자체 Agent 루프를 사용하든, 어떤 언어로 작성했든 호출 가능한 인터페이스만 있으면 됩니다. HTTP, WebSocket, SDK 모두 가능합니다. 요청을 보내고 응답을 NiceEval이 읽을 수 있는 이벤트로 변환하는 Adapter를 작성하면 답변 내용, 도구 호출, 구조화된 출력과 사용량을 검증할 수 있습니다.

**Coding Agent와 확장 기능.** NiceEval은 Claude Code, Codex, OpenCode 등을 Docker 또는 클라우드 Sandbox에서 실행하고 실제 저장소와 작업을 제공합니다. 프로젝트 자체 테스트와 파일 변경을 기준으로 점수를 매기므로, Skill, Plugin 또는 memory를 설치한 뒤 Agent가 정말 일을 더 잘하는지 확인할 수 있습니다.

**LLM 게임을 포함한 모든 AI 애플리케이션.** 평가 대상이 반드시 대화형 Agent일 필요는 없습니다. LLM 게임, AI 소셜 앱, 생성형 워크플로는 메시지 교환 대신 게시, 답글, NPC 행동 같은 작업을 제공하는 경우가 많습니다. `defineAdapter`로 이러한 작업을 평가 케이스에 그대로 노출하세요. 타입이 있는 `t.post(...)`, `t.reply(...)`를 직접 호출하고 구조화된 결과와 세계 상태를 검사하며, 개방형 품질 평가는 Judge에 맡깁니다.

```ts
// evals/social-journey.eval.ts — the system under test is an AI-powered social app
export default x.defineEval({
  description: "Post and reply, get responses from AI characters, and keep the social world coherent",
  async test(t) {
    const initial = await t.visitDiscoveryPage();
    const post = await t.post({ intent: "Invite everyone to photograph the city at night", withImage: true });
    t.check(post, authoredPost(initial.viewerId)).label("The post belongs to the current player");

    const reply = await t.reply({ postId: post.id, intent: "Add the meeting point at the riverside path entrance" });
    const responses = await t.waitForReplies(reply.id);
    t.check(responses.length, greaterThan(0)).label("AI characters respond");
    t.check(worldMaterial(await t.refreshFeed()), coherentSocialWorld()).label("Social relationships remain intact after refresh");
  },
});
```

전체 프로젝트는 [`examples/zh/llm-x/`](../examples/zh/llm-x/)를 참고하세요. AI 기반 소셜 앱을 대상으로 게시, 답글, AI 캐릭터 반응, 타임라인 새로고침, 첨부 이미지 생성을 평가합니다.

## DeepEval, LangFuse, Braintrust를 바로 쓰지 않는 이유

DeepEval은 풍부한 지표 라이브러리를 갖춘 성숙한 Python 평가 프레임워크입니다. NiceEval은 다른 선택을 합니다.

- **TypeScript 네이티브**: 평가, Adapter, Experiment를 모두 타입이 있는 TS 코드로, Agent와 같은 언어로 작성합니다.
- **과정 검증**: 작업을 완료하려면 여러 차례의 대화, 도구 호출, 파일 읽기, 코드 수정이 필요할 수 있습니다. 최종 답변은 그중 일부입니다. NiceEval은 정답 데이터셋을 먼저 만들지 않아도 이러한 과정의 사실을 직접 검증합니다.
- **실제 환경에서 채점**: Coding Agent는 Docker 또는 클라우드 Sandbox에서 실행됩니다. 답변뿐 아니라 프로젝트 테스트와 파일 변경으로 채점합니다.
- **비교 실험을 핵심 기능으로 제공**: 평가 케이스와 실행 대상을 분리해 같은 케이스로 모델, 프롬프트, 확장 기능을 직접 비교합니다.

LangFuse, Braintrust 같은 관측 플랫폼은 ‘운영 환경에서 무슨 일이 있었는가’에 답하고, 평가는 ‘이 행동이 충분히 좋은가’에 답합니다. NiceEval은 후자와 평가 작성, 실행, 결과 확인, Agent 개선으로 이어지는 로컬 개발 과정에 집중합니다. 함께 사용할 수 있으므로 운영 트레이스를 계속 확인하면서 NiceEval 결과를 Braintrust에 보낼 수도 있습니다.

## 빠른 시작

가장 빠른 방법은 이미 사용하는 Coding Agent에게 통합을 맡기는 것입니다. 다음 문장을 보내세요.

```text
https://niceeval.com/INIT.md를 읽고 현재 저장소에 niceeval을 설치 및 통합한 다음, 첫 평가 케이스를 처음부터 끝까지 실행해 주세요.
```

직접 하려면 [빠른 시작](https://niceeval.com/docs/tutorials/quickstart)에 따라 파일 세 개를 작성하세요. 약 10분이면 첫 결과를 볼 수 있습니다.

## 문서

- [소개](https://niceeval.com/docs/introduction): NiceEval의 개념과 적합한 사용 사례
- [빠른 시작](https://niceeval.com/docs/tutorials/quickstart): 첫 평가 케이스 실행
- [실행 가능한 예제](https://niceeval.com/docs/examples): AI SDK, Claude SDK, Codex SDK, Pi, LangGraph 통합 프로젝트
- [Coding Agent 확장 평가](https://niceeval.com/docs/examples/coding-agent-extensions): 비교 실험으로 Skill과 Plugin의 효과 측정

## 공식 어댑터

- Coding Agent: Claude Code, Codex, Bub, OpenCode, Hermes Agent, OpenClaw. Alma는 예정
- Agent 프레임워크: AI SDK, Claude SDK, Codex SDK, Pi Agent SDK, LangGraph. vm0, Cursor Agent SDK는 예정

## 감사의 말

아래 프로젝트에서 영감을 받았으며, 일부 코드는 AI가 이 프로젝트들을 학습하여 작성했습니다.

- [eve](https://eve.dev): DX와 API 설계의 주된 영감
- [agent eval](https://github.com/vercel-labs/agent-eval)
- [ponytail](https://github.com/DietrichGebert/ponytail)

프로젝트 초기에 지원과 피드백을 보내 주신 [Linux.do](https://linux.do/)에 감사드립니다.
