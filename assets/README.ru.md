<div align="center">

# NiceEval

**Пишите оценки как модульные тесты, сравнивайте агентов как в эксперименте**

[![typescript](https://img.shields.io/badge/typescript-5.6-blue?style=flat-square)](../packages/niceeval/tsconfig.json)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../package.json)
[![docs](https://img.shields.io/badge/docs-niceeval.com-111827?style=flat-square)](https://niceeval.com/docs/introduction)
[![discord](https://img.shields.io/badge/discord-join%20chat-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/yTMdZjFFJ)

[English](../README.md) | [中文](../README.zh.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [français](README.fr.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português](README.pt.md)

</div>

Вы изменили промпт, сменили модель, написали новый Skill для Claude Code или настроили промпты NPC в игре. Стало ли действительно лучше?

Чаще всего ответ получают после нескольких ручных проб, полагаясь на ощущения. Но ответы LLM непредсказуемы: на один и тот же вопрос модель сейчас ответит верно, а в следующий раз ошибётся. Три успешные попытки не доказывают, что изменение полезно и ничего не сломало в другом месте.

NiceEval заменяет ощущения фактами. Основной сценарий — агенты, но оценивать можно любое приложение на базе LLM. На TypeScript вы описываете, что считать правильным: какой инструмент вызвать, что должен содержать ответ, проходят ли тесты после изменения кода, остаётся ли игровой мир согласованным после взаимодействия. NiceEval подключается к проверяемой системе, многократно запускает её, выставляет оценки и сохраняет диалоги, вызовы инструментов, изменения файлов, время и стоимость каждого запуска для сравнения и расследования.

Написание оценок похоже на модульные тесты, а их использование — на эксперименты:

- **Предотвращайте регрессии**: после изменения промпта, модели или зависимостей запускайте те же проверки и смотрите, не снизилась ли доля успешных результатов.
- **Сравнивайте варианты**: запускайте одинаковые проверки с двумя моделями, двумя версиями промпта, с установленным Skill и без него. Различия будут видны в числах и отдельных записях.
- **Подключайте CI**: блокируйте изменения, если оценка ниже порога.
- **Расширяйте покрытие**: превращайте сбои из реального использования в новые проверки, которые будут выполняться при каждом следующем изменении.

Всё работает на вашей машине и в вашем CI. Регистрация не нужна.

## Пример

Проверим погодного помощника: в ответ на вопрос о погоде он должен действительно вызвать `get_weather`, а не выдумать ответ.

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

Какого агента и с какой моделью запускать, задаётся в Experiment отдельно от проверок. Поэтому одни и те же проверки можно напрямую использовать для сравнения двух моделей или версий промпта:

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

Полный запускаемый проект находится в [`examples/zh/ai-sdk/`](../examples/zh/ai-sdk/).

## Что можно оценивать?

**Собственные AI-приложения.** Неважно, используют они AI SDK, LangGraph, Pi или собственный цикл агента и на каком языке написаны. Достаточно доступного интерфейса: HTTP, WebSocket или SDK. Напишите Adapter, который отправляет запросы и преобразует ответы в события, понятные NiceEval. Затем проверяйте содержимое ответов, вызовы инструментов, структурированные результаты и расход ресурсов.

**Агентов для программирования и их расширения.** NiceEval запускает Claude Code, Codex, OpenCode и других агентов в Docker или облачном Sandbox, предоставляет настоящий репозиторий и задачу, а затем оценивает результат по тестам самого проекта и изменениям файлов. Так можно выяснить, действительно ли Skill, Plugin или memory помогает агенту лучше работать.

**Любые AI-приложения, включая игры на базе LLM.** Проверяемая система не обязана быть диалоговым агентом. Игры с LLM, социальные AI-приложения и генеративные процессы часто предлагают действия вроде публикации поста, ответа или хода NPC вместо обмена сообщениями. Через `defineAdapter` передайте эти операции непосредственно проверкам. Вызывайте типизированные `t.post(...)` и `t.reply(...)`, проверяйте структурированные результаты и состояние мира, а оценку открытых качественных вопросов поручайте Judge.

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

Полный проект в [`examples/zh/llm-x/`](../examples/zh/llm-x/) — социальное приложение на базе AI. Проверки охватывают публикации, ответы, реакции AI-персонажей, обновление ленты и генерацию изображений к постам.

## Почему не использовать сразу DeepEval, LangFuse или Braintrust?

DeepEval — зрелый фреймворк оценки на Python с богатой библиотекой метрик. NiceEval делает другие акценты:

- **Нативный TypeScript**: проверки, Adapters и Experiments — типизированный TS-код на том же языке, что и ваш агент.
- **Проверка процесса**: для выполнения задачи часто нужны несколько ходов диалога, вызовы инструментов, чтение файлов и изменения кода. Итоговый ответ — лишь одна часть. NiceEval проверяет эти факты напрямую, не требуя заранее собрать эталонный датасет.
- **Оценка в реальном окружении**: агенты для программирования работают в Docker или облачных Sandbox. Результат оценивается по тестам проекта и изменениям файлов, а не только по тексту ответа.
- **Сравнительные эксперименты как основная возможность**: проверки отделены от выбора проверяемой системы. Одни и те же случаи напрямую сравнивают модели, промпты и расширения.

Платформы наблюдаемости вроде LangFuse и Braintrust отвечают на вопрос «Что произошло в продакшене?», а оценки — «Достаточно ли хорошо это поведение?». NiceEval сосредоточен на втором вопросе и локальном цикле разработки: написать проверки, запустить их, изучить результаты, улучшить агента. Эти инструменты совместимы: продолжайте смотреть продакшен-трейсы и отправляйте результаты NiceEval в Braintrust.

## Быстрый старт

Быстрее всего поручить интеграцию тому агенту для программирования, которым вы уже пользуетесь. Отправьте ему следующее:

```text
Прочитай https://niceeval.com/INIT.md, установи и интегрируй niceeval в текущий репозиторий и выполни первую проверку от начала до конца.
```

Для самостоятельной настройки следуйте [быстрому старту](https://niceeval.com/docs/tutorials/quickstart) и создайте три файла. Первый результат можно получить примерно за десять минут.

## Документация

- [Введение](https://niceeval.com/docs/introduction): что такое NiceEval и когда он полезен
- [Быстрый старт](https://niceeval.com/docs/tutorials/quickstart): запуск первой проверки
- [Запускаемые примеры](https://niceeval.com/docs/examples): проекты интеграции с AI SDK, Claude SDK, Codex SDK, Pi и LangGraph
- [Оценка расширений агентов для программирования](https://niceeval.com/docs/examples/coding-agent-extensions): измерение эффекта Skills и Plugins в сравнительных экспериментах

## Официальные адаптеры

- Агенты для программирования: Claude Code, Codex, Bub, OpenCode, Hermes Agent, OpenClaw; Alma запланирован
- Фреймворки агентов: AI SDK, Claude SDK, Codex SDK, Pi Agent SDK, LangGraph; vm0 и Cursor Agent SDK запланированы

## Благодарности

Проект вдохновлён следующими работами; часть кода написана AI, обучавшимся на них:

- [eve](https://eve.dev): основной источник вдохновения для DX и дизайна API
- [agent eval](https://github.com/vercel-labs/agent-eval)
- [ponytail](https://github.com/DietrichGebert/ponytail)

Спасибо [Linux.do](https://linux.do/) за поддержку и обратную связь на раннем этапе разработки.
