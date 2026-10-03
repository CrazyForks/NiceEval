<div align="center">

# NiceEval

**Evals wie Unit-Tests schreiben, Agents wie in Experimenten vergleichen**

[![typescript](https://img.shields.io/badge/typescript-5.6-blue?style=flat-square)](../packages/niceeval/tsconfig.json)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../package.json)
[![docs](https://img.shields.io/badge/docs-niceeval.com-111827?style=flat-square)](https://niceeval.com/docs/introduction)
[![discord](https://img.shields.io/badge/discord-join%20chat-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/yTMdZjFFJ)

[English](../README.md) | [中文](../README.zh.md) | [Español](README.es.md) | [français](README.fr.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português](README.pt.md) | [Русский](README.ru.md)

</div>

Du hast einen Prompt überarbeitet, das Modell gewechselt, einen neuen Skill für Claude Code geschrieben oder die Prompts der NPCs in einem Spiel angepasst. Ist es dadurch wirklich besser geworden?

Meist probiert man es ein paar Mal aus und entscheidet nach Gefühl. Doch LLM-Ausgaben sind unvorhersehbar: Dieselbe Frage kann jetzt richtig und beim nächsten Mal falsch beantwortet werden. Drei erfolgreiche Versuche beweisen weder, dass die Änderung wirkt, noch, dass sie nichts anderes beschädigt hat.

NiceEval ersetzt Bauchgefühl durch Belege. Im Mittelpunkt stehen Agents, aber jede LLM-basierte Anwendung lässt sich evaluieren. In TypeScript beschreibst du, was als richtig gilt: welches Tool aufgerufen werden soll, was eine Antwort enthalten muss, ob Tests nach einer Codeänderung bestehen oder ob eine Spielwelt nach einer Interaktion stimmig bleibt. NiceEval verbindet sich mit dem Testobjekt, führt wiederholte Durchläufe aus, bewertet sie und bewahrt Gespräche, Tool-Aufrufe, Dateiänderungen, Laufzeiten und Kosten jedes Durchlaufs zum Vergleichen und Nachforschen auf.

Das Schreiben ähnelt Unit-Tests, die Nutzung eher Experimenten:

- **Regressionen erkennen**: Nach Prompt-Änderungen, Modellwechseln oder Dependency-Updates dieselben Evals erneut ausführen und prüfen, ob die Erfolgsquote sinkt.
- **Alternativen vergleichen**: Dieselben Evals mit zwei Modellen, zwei Prompt-Versionen oder mit und ohne Skill ausführen. Unterschiede werden in Zahlen und einzelnen Aufzeichnungen sichtbar.
- **In CI einbinden**: Änderungen blockieren, wenn die Bewertung unter einen Grenzwert fällt.
- **Abdeckung erweitern**: Fehler aus der tatsächlichen Nutzung als neue Evals festhalten, die bei künftigen Änderungen mitgeprüft werden.

Alles läuft auf deinem eigenen Rechner und in deiner CI. Ein Konto ist nicht nötig.

## Ein Beispiel

Prüfe einen Wetterassistenten: Bei einer Wetterfrage soll er tatsächlich `get_weather` aufrufen, statt eine Antwort zu erfinden.

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

Welcher Agent mit welchem Modell ausgeführt wird, steht im Experiment, getrennt von den Eval-Fällen. So lassen sich dieselben Fälle direkt zum Vergleich zweier Modelle oder Prompt-Versionen nutzen:

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

Ein vollständiges, ausführbares Projekt findest du unter [`examples/zh/ai-sdk/`](../examples/zh/ai-sdk/).

## Was lässt sich evaluieren?

**Deine eigenen KI-Anwendungen.** Ob AI SDK, LangGraph, Pi oder eine eigene Agent-Schleife, unabhängig von der Programmiersprache: Es genügt eine aufrufbare Schnittstelle wie HTTP, WebSocket oder ein SDK. Ein Adapter sendet Anfragen und übersetzt Antworten in Ereignisse, die NiceEval lesen kann. Dann kannst du Antwortinhalte, Tool-Aufrufe, strukturierte Ausgaben und Verbrauch prüfen.

**Coding Agents und ihre Erweiterungen.** NiceEval führt Claude Code, Codex, OpenCode und andere Agents in Docker oder einer Cloud-Sandbox aus, gibt ihnen ein echtes Repository und eine Aufgabe und bewertet das Ergebnis anhand der projekteigenen Tests und Dateiänderungen. So lässt sich prüfen, ob ein Skill, Plugin oder memory den Agent tatsächlich besser arbeiten lässt.

**Beliebige KI-Anwendungen, etwa LLM-Spiele.** Das Testobjekt muss kein dialogorientierter Agent sein. LLM-Spiele, KI-Social-Apps und generative Workflows bieten häufig Aktionen wie Posten, Antworten oder NPC-Handlungen statt eines Nachrichtenaustauschs. Mit `defineAdapter` stellst du diese Aktionen den Eval-Fällen direkt bereit. Dort rufst du typisierte Methoden wie `t.post(...)` und `t.reply(...)` auf, prüfst strukturierte Ergebnisse und den Weltzustand und überlässt offene Qualitätsfragen einem Judge.

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

Das vollständige Projekt unter [`examples/zh/llm-x/`](../examples/zh/llm-x/) ist eine KI-basierte Social-App. Die Evals decken Posts, Antworten, Reaktionen von KI-Figuren, das Aktualisieren der Timeline und das Erzeugen begleitender Bilder ab.

## Warum nicht einfach DeepEval, LangFuse oder Braintrust?

DeepEval ist ein ausgereiftes Python-Evaluierungsframework mit einer umfangreichen Metrikbibliothek. NiceEval setzt andere Schwerpunkte:

- **Nativ in TypeScript**: Evals, Adapter und Experiments sind typisierter TS-Code, in derselben Sprache wie dein Agent.
- **Den Ablauf prüfen**: Eine Aufgabe umfasst oft mehrere Gesprächsrunden, Tool-Aufrufe, Dateizugriffe und Codeänderungen. Die abschließende Antwort ist nur ein Teil davon. NiceEval prüft diese Fakten direkt, ohne zuvor einen Golden-Datensatz zu verlangen.
- **In echten Umgebungen bewerten**: Coding Agents laufen in Docker oder Cloud-Sandboxes. Bewertet werden die projekteigenen Tests und Dateiänderungen, nicht nur Antworten.
- **Vergleichsexperimente als Kernfunktion**: Eval-Fälle und Testobjekt werden getrennt definiert. Dieselben Fälle vergleichen Modelle, Prompts und Erweiterungen direkt.

Observability-Plattformen wie LangFuse und Braintrust beantworten „Was ist in Produktion passiert?“, Evals dagegen „Ist dieses Verhalten gut genug?“. NiceEval konzentriert sich auf Letzteres und den lokalen Entwicklungszyklus: Evals schreiben, ausführen, Ergebnisse ansehen, Agent verbessern. Beides lässt sich kombinieren: Nutze weiterhin Produktions-Traces und übermittle NiceEval-Ergebnisse an Braintrust.

## Schnellstart

Am schnellsten lässt du den Coding Agent, den du bereits nutzt, NiceEval einrichten. Sende ihm diesen Auftrag:

```text
Lies https://niceeval.com/INIT.md, installiere und integriere niceeval im aktuellen Repository und führe den ersten Eval-Fall von Anfang bis Ende aus.
```

Wenn du selbst starten möchtest, schreibe nach der [Schnellstartanleitung](https://niceeval.com/docs/tutorials/quickstart) drei Dateien. Nach ungefähr zehn Minuten kannst du das erste Ergebnis sehen.

## Dokumentation

- [Einführung](https://niceeval.com/docs/introduction): Was NiceEval ist und wofür es sich eignet
- [Schnellstart](https://niceeval.com/docs/tutorials/quickstart): Den ersten Eval-Fall ausführen
- [Ausführbare Beispiele](https://niceeval.com/docs/examples): Integrationsprojekte für AI SDK, Claude SDK, Codex SDK, Pi und LangGraph
- [Coding-Agent-Erweiterungen evaluieren](https://niceeval.com/docs/examples/coding-agent-extensions): Die Wirkung von Skills und Plugins mit Vergleichsexperimenten messen

## Offizielle Adapter

- Coding Agents: Claude Code, Codex, Bub, OpenCode, Hermes Agent, OpenClaw; Alma ist geplant
- Agent-Frameworks: AI SDK, Claude SDK, Codex SDK, Pi Agent SDK, LangGraph; vm0 und Cursor Agent SDK sind geplant

## Danksagung

Die folgenden Projekte haben dieses Projekt inspiriert. Ein Teil des Codes wurde von KI geschrieben, die daraus gelernt hat:

- [eve](https://eve.dev): wichtigste Inspiration für DX und API-Design
- [agent eval](https://github.com/vercel-labs/agent-eval)
- [ponytail](https://github.com/DietrichGebert/ponytail)

Danke an [Linux.do](https://linux.do/) für die Unterstützung und das Feedback in der frühen Entwicklungsphase.
