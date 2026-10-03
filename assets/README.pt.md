<div align="center">

# NiceEval

**Escreva avaliações como testes unitários, compare agentes como em experimentos**

[![typescript](https://img.shields.io/badge/typescript-5.6-blue?style=flat-square)](../packages/niceeval/tsconfig.json)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../package.json)
[![docs](https://img.shields.io/badge/docs-niceeval.com-111827?style=flat-square)](https://niceeval.com/docs/introduction)
[![discord](https://img.shields.io/badge/discord-join%20chat-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/yTMdZjFFJ)

[English](../README.md) | [中文](../README.zh.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [français](README.fr.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md)

</div>

Você revisou um prompt, trocou de modelo, criou um novo Skill para o Claude Code ou ajustou os prompts dos NPCs de um jogo. Será que melhorou mesmo?

Na maioria das vezes, a resposta vem de algumas tentativas e da intuição. Mas as saídas de um LLM são imprevisíveis: a mesma pergunta pode ser respondida corretamente agora e incorretamente depois. Três tentativas bem-sucedidas não provam que a mudança funciona nem que não quebrou outra coisa.

O NiceEval substitui a intuição por evidências. Seu foco principal são agentes, mas ele avalia qualquer aplicação baseada em LLM. Você descreve em TypeScript o que significa acertar: qual ferramenta chamar, o que a resposta deve conter, se os testes passam após uma alteração no código ou se o mundo de um jogo continua coerente depois de uma interação. O NiceEval conecta-se ao sistema avaliado, executa-o repetidamente, atribui notas e mantém as conversas, chamadas de ferramentas, alterações de arquivos, tempos e custos de cada execução para comparação e investigação.

Escrever avaliações se parece com escrever testes unitários; usá-las se parece mais com fazer experimentos:

- **Evitar regressões**: execute as mesmas avaliações após alterar prompts, trocar modelos ou atualizar dependências e confira se a taxa de aprovação caiu.
- **Comparar alternativas**: execute os mesmos casos com dois modelos, duas versões de um prompt ou com e sem um Skill. As diferenças aparecem nos números e nos registros individuais.
- **Integrar ao CI**: bloqueie alterações quando a nota ficar abaixo de um limite.
- **Ampliar a cobertura**: transforme falhas do uso real em novos casos que serão verificados em todas as mudanças futuras.

Tudo roda na sua máquina e no seu CI. Não é preciso criar uma conta.

## Um exemplo

Verifique um assistente de clima: ao perguntar sobre o tempo, ele deve realmente chamar `get_weather`, em vez de inventar uma resposta.

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

O Experiment define qual agente e qual modelo executar, separadamente dos casos de avaliação. Assim, os mesmos casos podem comparar diretamente dois modelos ou duas versões de um prompt:

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

Um projeto completo e executável está em [`examples/zh/ai-sdk/`](../examples/zh/ai-sdk/).

## O que é possível avaliar?

**Suas próprias aplicações de IA.** Seja com AI SDK, LangGraph, Pi ou um loop de agente próprio, em qualquer linguagem, basta ter uma interface acessível: HTTP, WebSocket ou SDK. Escreva um Adapter que envie solicitações e traduza as respostas em eventos legíveis pelo NiceEval. Depois, verifique o conteúdo das respostas, as chamadas de ferramentas, as saídas estruturadas e o consumo.

**Agentes de programação e suas extensões.** O NiceEval executa Claude Code, Codex, OpenCode e outros agentes em Docker ou em um Sandbox na nuvem, fornece um repositório real e uma tarefa e avalia o resultado com os testes do projeto e as alterações de arquivos. Isso ajuda a responder se instalar um Skill, Plugin ou memory realmente melhora o trabalho do agente.

**Qualquer aplicação de IA, incluindo jogos com LLM.** O sistema avaliado não precisa ser um agente de conversa. Jogos com LLM, aplicativos sociais de IA e fluxos generativos costumam oferecer operações como publicar, responder ou executar ações de NPC, em vez de trocar mensagens. Use `defineAdapter` para expor essas operações diretamente aos casos. Chame métodos tipados como `t.post(...)` e `t.reply(...)`, verifique resultados estruturados e o estado do mundo e deixe a avaliação de qualidade aberta para um Judge.

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

Veja o projeto completo em [`examples/zh/llm-x/`](../examples/zh/llm-x/): um aplicativo social baseado em IA com avaliações de publicações, respostas, reações de personagens de IA, atualização da linha do tempo e geração de imagens para as publicações.

## Por que não usar diretamente DeepEval, LangFuse ou Braintrust?

O DeepEval é um framework de avaliação maduro em Python com uma ampla biblioteca de métricas. O NiceEval faz escolhas diferentes:

- **TypeScript nativo**: avaliações, Adapters e Experiments são código TS tipado, na mesma linguagem do seu agente.
- **Verificar o processo**: concluir uma tarefa costuma exigir vários turnos de conversa, chamadas de ferramentas, leituras de arquivos e alterações de código. A resposta final é apenas uma parte. O NiceEval verifica esses fatos diretamente, sem exigir antes um conjunto de dados de referência.
- **Avaliar em ambientes reais**: agentes de programação rodam em Docker ou Sandboxes na nuvem e recebem notas com base nos testes e nas alterações de arquivos do projeto, além das respostas.
- **Experimentos comparativos como função central**: os casos ficam separados da escolha do sistema avaliado. Os mesmos casos comparam modelos, prompts e extensões diretamente.

Plataformas de observabilidade como LangFuse e Braintrust respondem a “o que aconteceu em produção?”. As avaliações respondem a “esse comportamento é bom o suficiente?”. O NiceEval concentra-se na segunda pergunta e no ciclo local de escrever avaliações, executá-las, examinar resultados e melhorar o agente. Eles podem coexistir: continue acompanhando traces de produção e envie os resultados do NiceEval ao Braintrust.

## Início rápido

O caminho mais rápido é pedir ao agente de programação que você já usa para integrar o NiceEval. Envie esta mensagem:

```text
Leia https://niceeval.com/INIT.md, instale e integre o niceeval no repositório atual e execute o primeiro caso de avaliação de ponta a ponta.
```

Para fazer por conta própria, siga o [início rápido](https://niceeval.com/docs/tutorials/quickstart) e escreva três arquivos. Em cerca de dez minutos, você poderá ver o primeiro resultado.

## Documentação

- [Introdução](https://niceeval.com/docs/introduction): o que é o NiceEval e quando usá-lo
- [Início rápido](https://niceeval.com/docs/tutorials/quickstart): execute o primeiro caso de avaliação
- [Exemplos executáveis](https://niceeval.com/docs/examples): projetos de integração com AI SDK, Claude SDK, Codex SDK, Pi e LangGraph
- [Avaliar extensões de agentes de programação](https://niceeval.com/docs/examples/coding-agent-extensions): meça os efeitos de Skills e Plugins com experimentos comparativos

## Adaptadores oficiais

- Agentes de programação: Claude Code, Codex, Bub, OpenCode, Hermes Agent, OpenClaw; Alma está planejado
- Frameworks de agentes: AI SDK, Claude SDK, Codex SDK, Pi Agent SDK, LangGraph; vm0 e Cursor Agent SDK estão planejados

## Agradecimentos

Os projetos abaixo inspiraram este projeto, e parte do código foi escrita por IA aprendendo com eles:

- [eve](https://eve.dev): principal inspiração para a DX e o design da API
- [agent eval](https://github.com/vercel-labs/agent-eval)
- [ponytail](https://github.com/DietrichGebert/ponytail)

Obrigado ao [Linux.do](https://linux.do/) pelo apoio e feedback no início do desenvolvimento.
