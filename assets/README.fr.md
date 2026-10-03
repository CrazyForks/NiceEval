<div align="center">

# NiceEval

**Écrivez vos évaluations comme des tests unitaires, comparez vos agents comme dans une expérience**

[![typescript](https://img.shields.io/badge/typescript-5.6-blue?style=flat-square)](../packages/niceeval/tsconfig.json)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../package.json)
[![docs](https://img.shields.io/badge/docs-niceeval.com-111827?style=flat-square)](https://niceeval.com/docs/introduction)
[![discord](https://img.shields.io/badge/discord-join%20chat-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/yTMdZjFFJ)

[English](../README.md) | [中文](../README.zh.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português](README.pt.md) | [Русский](README.ru.md)

</div>

Vous avez modifié un prompt, changé de modèle, écrit un nouveau Skill pour Claude Code ou ajusté les prompts des PNJ d'un jeu. Est-ce vraiment mieux ?

La réponse vient souvent de quelques essais et d'une impression. Mais les sorties d'un LLM sont imprévisibles : une même question peut recevoir une réponse correcte cette fois et incorrecte la suivante. Trois essais réussis ne prouvent ni que le changement fonctionne, ni qu'il n'a rien cassé ailleurs.

NiceEval remplace les impressions par des preuves. Il vise principalement les agents, mais permet d'évaluer toute application utilisant un LLM. Vous décrivez en TypeScript ce qui constitue un résultat correct : quel outil appeler, ce que la réponse doit contenir, si les tests passent après une modification du code ou si le monde d'un jeu reste cohérent après une interaction. NiceEval se connecte au système évalué, l'exécute plusieurs fois, attribue des scores et conserve les conversations, appels d'outils, modifications de fichiers, durées et coûts de chaque exécution pour comparer et enquêter.

L'écriture ressemble à celle de tests unitaires ; l'utilisation, plutôt à des expériences :

- **Détecter les régressions** : relancez les mêmes évaluations après un changement de prompt, de modèle ou de dépendances et vérifiez si le taux de réussite baisse.
- **Comparer les options** : exécutez les mêmes cas avec deux modèles, deux versions d'un prompt, ou avec et sans un Skill. Les différences apparaissent dans les chiffres et les enregistrements individuels.
- **Intégrer la CI** : bloquez les changements si le score passe sous un seuil.
- **Élargir la couverture** : transformez les échecs observés en usage réel en nouveaux cas qui seront vérifiés à chaque changement futur.

Tout s'exécute sur votre machine et dans votre CI. Aucun compte n'est nécessaire.

## Un exemple

Vérifiez un assistant météo : lorsqu'on lui demande le temps, il doit réellement appeler `get_weather` au lieu d'inventer une réponse.

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

L'Experiment précise quel agent et quel modèle utiliser, indépendamment des cas d'évaluation. Les mêmes cas permettent donc de comparer directement deux modèles ou deux versions d'un prompt :

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

Un projet complet et exécutable est disponible dans [`examples/zh/ai-sdk/`](../examples/zh/ai-sdk/).

## Que peut-on évaluer ?

**Vos propres applications d'IA.** Qu'elles utilisent AI SDK, LangGraph, Pi ou votre propre boucle d'agent, et quel que soit leur langage, une interface accessible suffit : HTTP, WebSocket ou SDK. Écrivez un Adapter qui envoie les requêtes et traduit les réponses en événements lisibles par NiceEval. Vous pourrez vérifier le contenu des réponses, les appels d'outils, les sorties structurées et la consommation.

**Les agents de programmation et leurs extensions.** NiceEval exécute Claude Code, Codex, OpenCode et d'autres agents dans Docker ou un Sandbox cloud, leur fournit un vrai dépôt et une tâche, puis les évalue à partir des tests du projet et des modifications de fichiers. Cela permet de vérifier si l'ajout d'un Skill, d'un Plugin ou de memory améliore réellement leur travail.

**Toute application d'IA, y compris les jeux utilisant un LLM.** Le système évalué n'est pas forcément un agent conversationnel. Les jeux LLM, applications sociales d'IA et workflows génératifs exposent souvent des actions métier — publier, répondre, faire agir un PNJ — plutôt que de simples échanges de messages. Avec `defineAdapter`, exposez directement ces opérations aux cas d'évaluation. Appelez des méthodes typées comme `t.post(...)` et `t.reply(...)`, vérifiez les résultats structurés et l'état du monde, puis confiez la qualité ouverte à un Judge.

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

Le projet complet dans [`examples/zh/llm-x/`](../examples/zh/llm-x/) est une application sociale fondée sur l'IA. Ses évaluations couvrent les publications, réponses, réactions des personnages d'IA, actualisations du fil et générations d'images associées.

## Pourquoi ne pas simplement utiliser DeepEval, LangFuse ou Braintrust ?

DeepEval est un framework d'évaluation Python mature, doté d'une riche bibliothèque de métriques. NiceEval fait d'autres choix :

- **TypeScript natif** : évaluations, Adapters et Experiments sont du code TS typé, dans le même langage que votre agent.
- **Vérifier le déroulement** : réussir une tâche demande souvent plusieurs tours de conversation, appels d'outils, lectures de fichiers et modifications de code. La réponse finale n'est qu'une étape. NiceEval vérifie directement ces faits, sans exiger d'abord un jeu de données de référence.
- **Évaluer dans un environnement réel** : les agents de programmation tournent dans Docker ou des Sandboxes cloud et sont évalués avec les tests et modifications de fichiers du projet, au-delà de leurs seules réponses.
- **Des expériences comparatives au premier plan** : les cas sont séparés du choix du système évalué. Les mêmes cas comparent directement modèles, prompts et extensions.

Les plateformes d'observabilité comme LangFuse et Braintrust répondent à « Que s'est-il passé en production ? ». Les évaluations répondent à « Ce comportement est-il suffisamment bon ? ». NiceEval se concentre sur cette seconde question et sur la boucle locale : écrire les évaluations, les exécuter, examiner les résultats, améliorer l'agent. Les deux peuvent coexister : continuez à consulter les traces de production et envoyez les résultats NiceEval à Braintrust.

## Démarrage rapide

Le plus rapide est de demander à l'agent de programmation que vous utilisez déjà d'intégrer NiceEval. Envoyez-lui ceci :

```text
Lis https://niceeval.com/INIT.md, installe et intègre niceeval dans le dépôt actuel, puis exécute le premier cas d'évaluation de bout en bout.
```

Pour le faire vous-même, suivez le [démarrage rapide](https://niceeval.com/docs/tutorials/quickstart) et écrivez trois fichiers. Vous pourrez voir un premier résultat en une dizaine de minutes.

## Documentation

- [Introduction](https://niceeval.com/docs/introduction) : présentation de NiceEval et cas d'usage
- [Démarrage rapide](https://niceeval.com/docs/tutorials/quickstart) : exécuter votre premier cas
- [Exemples exécutables](https://niceeval.com/docs/examples) : projets d'intégration avec AI SDK, Claude SDK, Codex SDK, Pi et LangGraph
- [Évaluer les extensions d'agents de programmation](https://niceeval.com/docs/examples/coding-agent-extensions) : mesurer l'effet des Skills et Plugins par des expériences comparatives

## Adaptateurs officiels

- Agents de programmation : Claude Code, Codex, Bub, OpenCode, Hermes Agent, OpenClaw ; Alma est prévu
- Frameworks d'agents : AI SDK, Claude SDK, Codex SDK, Pi Agent SDK, LangGraph ; vm0 et Cursor Agent SDK sont prévus

## Remerciements

Les projets suivants ont inspiré ce projet ; une partie du code a été écrite par une IA ayant appris de ces projets :

- [eve](https://eve.dev) : principale inspiration pour la DX et la conception de l'API
- [agent eval](https://github.com/vercel-labs/agent-eval)
- [ponytail](https://github.com/DietrichGebert/ponytail)

Merci à [Linux.do](https://linux.do/) pour son soutien et ses retours au début du projet.
