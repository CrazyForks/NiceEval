<div align="center">

# NiceEval

**Escribe evaluaciones como tests unitarios, compara agentes como en un experimento**

[![typescript](https://img.shields.io/badge/typescript-5.6-blue?style=flat-square)](../packages/niceeval/tsconfig.json)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../package.json)
[![docs](https://img.shields.io/badge/docs-niceeval.com-111827?style=flat-square)](https://niceeval.com/docs/introduction)
[![discord](https://img.shields.io/badge/discord-join%20chat-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/yTMdZjFFJ)

[English](../README.md) | [中文](../README.zh.md) | [Deutsch](README.de.md) | [français](README.fr.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português](README.pt.md) | [Русский](README.ru.md)

</div>

Has cambiado un prompt, sustituido un modelo, creado un Skill para Claude Code o ajustado los prompts de los NPC de un juego. ¿Ha mejorado de verdad?

Normalmente, la respuesta sale de probar unas cuantas veces y dejarse llevar por la intuición. Pero las respuestas de un LLM son impredecibles: la misma pregunta puede acertarse ahora y fallar después. Tres intentos correctos no demuestran que el cambio funcione ni que no haya roto algo más.

NiceEval sustituye la intuición por evidencias. Se centra en agentes, pero permite evaluar cualquier aplicación basada en LLM. En TypeScript defines qué significa hacerlo bien: qué herramienta llamar, qué debe contener una respuesta, si pasan los tests tras modificar el código o si el mundo de un juego sigue siendo coherente después de una interacción. NiceEval conecta con el sistema evaluado, lo ejecuta repetidamente, lo puntúa y conserva las conversaciones, llamadas a herramientas, cambios de archivos, tiempos y costes de cada ejecución para comparar e investigar.

Escribir evaluaciones se parece a escribir tests unitarios; usarlas se parece más a hacer experimentos:

- **Detectar regresiones**: repite las mismas evaluaciones al cambiar prompts, modelos o dependencias y comprueba si baja la tasa de éxito.
- **Comparar alternativas**: ejecuta los mismos casos con dos modelos, dos versiones de un prompt o con y sin un Skill. Las diferencias quedan en cifras y registros individuales.
- **Integrar con CI**: bloquea cambios si la puntuación cae por debajo de un umbral.
- **Ampliar la cobertura**: convierte los fallos del uso real en nuevos casos que se comprobarán con cada cambio futuro.

Todo se ejecuta en tu máquina y en tu CI. No necesitas una cuenta.

## Un ejemplo

Comprueba un asistente meteorológico: al preguntar por el tiempo, debe llamar realmente a `get_weather`, en lugar de inventarse una respuesta.

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

El Experiment define qué agente y qué modelo usar, por separado de los casos de evaluación. Así puedes comparar directamente dos modelos o dos versiones de un prompt con los mismos casos:

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

Encontrarás un proyecto completo y ejecutable en [`examples/zh/ai-sdk/`](../examples/zh/ai-sdk/).

## ¿Qué puedes evaluar?

**Tus propias aplicaciones de IA.** Tanto si usan AI SDK, LangGraph, Pi o un bucle de agente propio, y sea cual sea su lenguaje, basta con una interfaz accesible: HTTP, WebSocket o un SDK. Escribe un Adapter que envíe peticiones y traduzca respuestas a eventos que NiceEval pueda leer. Después comprueba el contenido, las llamadas a herramientas, las salidas estructuradas y el consumo.

**Agentes de programación y sus extensiones.** NiceEval ejecuta Claude Code, Codex, OpenCode y otros agentes en Docker o en un Sandbox en la nube, les proporciona un repositorio real y una tarea, y puntúa el resultado con los tests del proyecto y los cambios en archivos. Permite comprobar si instalar un Skill, Plugin o memory realmente ayuda al agente a trabajar mejor.

**Cualquier aplicación de IA, incluidos juegos con LLM.** El sistema evaluado no tiene por qué ser un agente conversacional. Los juegos con LLM, las aplicaciones sociales de IA y los flujos generativos suelen ofrecer operaciones como publicar, responder o realizar acciones de NPC, en vez de intercambiar mensajes. Con `defineAdapter`, expones directamente esas operaciones a los casos. Llama a métodos tipados como `t.post(...)` y `t.reply(...)`, comprueba resultados estructurados y el estado del mundo, y deja la calidad abierta a un Judge.

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

El proyecto completo en [`examples/zh/llm-x/`](../examples/zh/llm-x/) es una aplicación social basada en IA. Las evaluaciones cubren publicaciones, respuestas, reacciones de personajes de IA, actualización de la cronología y generación de imágenes para las publicaciones.

## ¿Por qué no usar directamente DeepEval, LangFuse o Braintrust?

DeepEval es un framework de evaluación maduro en Python con una amplia biblioteca de métricas. NiceEval toma otras decisiones:

- **TypeScript nativo**: evaluaciones, Adapters y Experiments son código TS tipado, en el mismo lenguaje que tu agente.
- **Comprobar el proceso**: completar una tarea suele exigir varios turnos, llamadas a herramientas, lecturas de archivos y cambios de código. La respuesta final es solo una parte. NiceEval comprueba directamente esos hechos sin exigir primero un conjunto de datos de referencia.
- **Puntuar en entornos reales**: los agentes de programación se ejecutan en Docker o Sandboxes en la nube y se puntúan con los tests y cambios de archivos del proyecto, más allá de sus respuestas.
- **Experimentos comparativos como función central**: separar los casos del sistema evaluado permite comparar modelos, prompts y extensiones con los mismos casos.

Las plataformas de observabilidad como LangFuse y Braintrust responden a «¿qué ocurrió en producción?». Las evaluaciones responden a «¿es suficientemente bueno este comportamiento?». NiceEval se centra en lo segundo y en el ciclo local de escribir evaluaciones, ejecutarlas, revisar resultados y mejorar el agente. Pueden coexistir: sigue consultando trazas de producción y envía los resultados de NiceEval a Braintrust.

## Inicio rápido

La forma más rápida es pedir al agente de programación que ya utilizas que integre NiceEval. Envíale lo siguiente:

```text
Lee https://niceeval.com/INIT.md, instala e integra niceeval en el repositorio actual y ejecuta el primer caso de evaluación de principio a fin.
```

Si prefieres hacerlo tú, sigue el [inicio rápido](https://niceeval.com/docs/tutorials/quickstart) para escribir tres archivos. Podrás ver el primer resultado en unos diez minutos.

## Documentación

- [Introducción](https://niceeval.com/docs/introduction): qué es NiceEval y cuándo utilizarlo
- [Inicio rápido](https://niceeval.com/docs/tutorials/quickstart): ejecutar el primer caso de evaluación
- [Ejemplos ejecutables](https://niceeval.com/docs/examples): proyectos de integración con AI SDK, Claude SDK, Codex SDK, Pi y LangGraph
- [Evaluar extensiones de agentes de programación](https://niceeval.com/docs/examples/coding-agent-extensions): medir el efecto de Skills y Plugins mediante experimentos comparativos

## Adaptadores oficiales

- Agentes de programación: Claude Code, Codex, Bub, OpenCode, Hermes Agent, OpenClaw; Alma está previsto
- Frameworks de agentes: AI SDK, Claude SDK, Codex SDK, Pi Agent SDK, LangGraph; vm0 y Cursor Agent SDK están previstos

## Agradecimientos

Los siguientes proyectos inspiraron este proyecto; parte del código fue escrito por IA aprendiendo de ellos:

- [eve](https://eve.dev): principal inspiración para la DX y el diseño de la API
- [agent eval](https://github.com/vercel-labs/agent-eval)
- [ponytail](https://github.com/DietrichGebert/ponytail)

Gracias a [Linux.do](https://linux.do/) por su apoyo y comentarios durante las primeras etapas del proyecto.
