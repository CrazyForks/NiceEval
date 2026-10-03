<div align="center">

# NiceEval

**ユニットテストのように評価を書き、実験のように Agent を比較する**

[![typescript](https://img.shields.io/badge/typescript-5.6-blue?style=flat-square)](../packages/niceeval/tsconfig.json)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../package.json)
[![docs](https://img.shields.io/badge/docs-niceeval.com-111827?style=flat-square)](https://niceeval.com/docs/introduction)
[![discord](https://img.shields.io/badge/discord-join%20chat-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/yTMdZjFFJ)

[English](../README.md) | [中文](../README.zh.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [français](README.fr.md) | [한국어](README.ko.md) | [Português](README.pt.md) | [Русский](README.ru.md)

</div>

プロンプトを改良した、モデルを変更した、Claude Code 用の新しい Skill を書いた、ゲームの NPC のプロンプトを調整した。それで、本当に良くなったのでしょうか？

多くの場合、何度か試して感覚で判断しています。しかし LLM の出力は不確実です。同じ質問でも、今回は正解して次は間違えるかもしれません。3 回成功しただけでは、変更が有効だとも、他の部分を壊していないとも言えません。

NiceEval は感覚を証拠に置き換えます。主な対象は Agent ですが、LLM を使うあらゆるアプリを評価できます。「何をもって正しいとするか」を TypeScript で記述します。どのツールを呼ぶべきか、回答に何を含めるべきか、コード変更後にテストが通るか、やり取りの後もゲーム世界の整合性が保たれているか。NiceEval が対象に接続して繰り返し実行し、採点します。各実行の会話、ツール呼び出し、ファイル変更、所要時間、費用を残し、比較や調査に使えます。

書き方はユニットテストに似ていますが、使い方は実験に近いものです。

- **回帰を防ぐ**：プロンプトやモデルの変更、依存関係の更新後に同じ評価を再実行し、合格率が下がっていないか確認します。
- **比較する**：同じ評価を 2 つのモデル、2 つのプロンプト、Skill の有無で実行します。違いは数値と個々の記録に表れます。
- **CI に組み込む**：スコアがしきい値を下回ったら変更を通しません。
- **評価を充実させる**：実際の利用で見つかった失敗を新しい評価にし、以後の変更でも毎回確認します。

すべて自分のマシンと CI で動きます。アカウント登録は不要です。

## 例

天気アシスタントを検証します。天気を聞かれたら、回答をでっち上げずに実際に `get_weather` を呼ぶ必要があります。

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

「どの Agent を、どのモデルで実行するか」は、評価ケースとは別に Experiment に記述します。そのため、同じケースで 2 つのモデルや 2 種類のプロンプトを直接比較できます。

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

実行可能な完全なプロジェクトは [`examples/zh/ai-sdk/`](../examples/zh/ai-sdk/) にあります。

## 何を評価できるか

**自分の AI アプリ。** AI SDK、LangGraph、Pi、独自の Agent ループのいずれでも、実装言語も問いません。HTTP、WebSocket、SDK など、呼び出せるインターフェースがあれば使えます。リクエストを送り、応答を NiceEval が読めるイベントに変換する Adapter を書けば、回答内容、ツール呼び出し、構造化出力、使用量を検証できます。

**Coding Agent とその拡張。** NiceEval は Claude Code、Codex、OpenCode などを Docker やクラウド Sandbox で動かし、実際のリポジトリとタスクを与え、プロジェクト自身のテストとファイル変更で採点します。「この Skill、Plugin、memory を入れると、本当に仕事がうまくなるのか」を確かめるのに適しています。

**LLM ゲームを含む、あらゆる AI アプリ。** 対象は対話型 Agent に限りません。LLM ゲーム、AI ソーシャルアプリ、生成ワークフローは、メッセージの往復ではなく「投稿」「返信」「NPC の行動」といった操作を提供することがあります。`defineAdapter` で操作をそのまま評価ケースに公開し、型付きの `t.post(...)` や `t.reply(...)` を直接呼び出します。構造化された結果や世界の状態を検証し、自由度の高い品質評価は Judge に任せます。

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

完全なプロジェクトは [`examples/zh/llm-x/`](../examples/zh/llm-x/) を参照してください。AI ソーシャルアプリを対象に、投稿、返信、AI キャラクターの反応、タイムラインの更新、投稿画像の生成を評価します。

## DeepEval、LangFuse、Braintrust をそのまま使わない理由

DeepEval は豊富な指標を備えた成熟した Python 評価フレームワークです。NiceEval は異なる設計上の選択をしています。

- **TypeScript ネイティブ**：評価、Adapter、Experiment はすべて型付き TS コードです。Agent と同じ言語で書けます。
- **過程を検証する**：タスクの成功には、複数ターンの会話、ツール呼び出し、ファイルの読み取り、コード変更が必要です。最終回答はその一部にすぎません。NiceEval は事前に正解データセットを用意しなくても、これらの事実を直接検証できます。
- **実環境で採点する**：Coding Agent を Docker やクラウド Sandbox で動かし、回答だけでなく、プロジェクトのテストとファイル変更で採点します。
- **比較実験を中心に据える**：評価ケースと実行対象を分離し、同じケースでモデル、プロンプト、拡張を直接比較できます。

LangFuse や Braintrust のような可観測性プラットフォームは「本番で何が起きたか」に答え、評価は「この振る舞いは十分に良いか」に答えます。NiceEval は後者と、評価を書き、実行し、結果を見て Agent を改善するローカル開発サイクルに集中しています。両者は併用できます。本番のトレースを引き続き確認しながら、NiceEval の結果を Braintrust に送ることもできます。

## クイックスタート

最も簡単なのは、普段使っている Coding Agent に導入を任せることです。次の文を送ってください。

```text
https://niceeval.com/INIT.md を読み、現在のリポジトリに niceeval をインストールして統合し、最初の評価ケースをエンドツーエンドで実行してください。
```

自分で進める場合は、[クイックスタート](https://niceeval.com/docs/tutorials/quickstart)に沿って 3 つのファイルを書けば、約 10 分で最初の結果を確認できます。

## ドキュメント

- [紹介](https://niceeval.com/docs/introduction)：NiceEval の概要と適した用途
- [クイックスタート](https://niceeval.com/docs/tutorials/quickstart)：最初の評価ケースを実行する
- [実行可能な例](https://niceeval.com/docs/examples)：AI SDK、Claude SDK、Codex SDK、Pi、LangGraph の統合プロジェクト
- [Coding Agent の拡張を評価する](https://niceeval.com/docs/examples/coding-agent-extensions)：比較実験で Skill と Plugin の効果を測る

## 公式アダプター

- Coding Agent：Claude Code、Codex、Bub、OpenCode、Hermes Agent、OpenClaw。Alma は予定
- Agent フレームワーク：AI SDK、Claude SDK、Codex SDK、Pi Agent SDK、LangGraph。vm0、Cursor Agent SDK は予定

## 謝辞

このプロジェクトは以下から着想を得ています。一部のコードは、AI がこれらのプロジェクトから学んで書きました。

- [eve](https://eve.dev)：DX と API 設計の主な着想源
- [agent eval](https://github.com/vercel-labs/agent-eval)
- [ponytail](https://github.com/DietrichGebert/ponytail)

初期の開発を支援し、フィードバックをくださった [Linux.do](https://linux.do/) に感謝します。
