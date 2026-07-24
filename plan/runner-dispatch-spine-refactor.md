# runner 派发脊柱统一重构:派发时刻用例锁 + 跨进程实验闸 + 失败分类两轴与止损闸

契约已全部定稿,一律以 docs 为准,本 plan 只列落点与任务树。本篇**吸收并取代** `plan/exp-case-lock-dispatch-time.md` 的全部 TODO(其验收并入本篇)。

契约落点:

- 派发时刻取锁、撞锁挂起转派、实验闸跨 Invocation 租约:`docs/feature/experiments/architecture.md#并发-invocation用例锁`
- 调度语义(两级闸持有期、实验闸名额域跨进程):`docs/runner.md#调度有界并发`;多开分工的缓存续接:`docs/runner.md#缓存指纹去重`
- 失败分类两轴词表、糖衣类、分类链(实验分类器先于 adapter,裁决见 `memory/failure-chain-experiment-before-adapter.md`)、重试执行体、止损执行体、Effect 边界:`docs/feature/error-classification/architecture.md`
- 止损语义、组合规则、非目标:`docs/feature/error-classification/README.md`;作者面写法:同目录 `library.md` 与 `use-case/`
- provisioning 对外 scope 映射(按配置解析域定档):`docs/feature/sandbox/architecture.md#provisioning-失败与重试`
- `unstarted` 成因(budget / fail-fast / 止损闸):`docs/runner.md#完成状态`、`docs/feature/experiments/architecture.md`「Invocation Completion」
- 覆盖类别(先声明后写测,已声明):`docs/engineering/testing/unit/experiments-runner.md`(取锁时机 / 多开分工 / 实验闸租约 / 止损闸)、`docs/engineering/testing/unit/eval.md`(失败分类链的两轴扩展)
- 显示与事件契约(`elsewhere`、`lock_wait`、五项恒等式):`docs/feature/experiments/cli.md`

## 任务树

无阶段划分;节点标注依赖,无依赖关系的节点即可并行。`──▶` 表示「必须等它完成」。三条天然泳道:**α**(A→C 主干)、**β**(B 数据层)、**γ**(测试与冒烟随各自依赖节点完成即开工)。C 内部严格串行,是全计划的关键路径。

```text
runner 派发脊柱统一重构
├─ A. 实验闸租约原语 `src/runner/gate-lease.ts`                    [无依赖,与 B 全体并行]
│     (experimentId, slot) 逐槽租约文件落 .niceeval/locks/;取位 = 对 0..N-1 任一空槽
│     O_EXCL 独占创建 + 心跳续租;释放 = 删除;过期经 rename 接管;min-N:取位前扫描
│     在场租约声明的 N,生效名额 = min(自己的 N, 在场声明)。复用 entry-file-store 原语
│     与 lock.ts 的心跳/过期/接管纪律(10s/30s 同参数),不复制第三份文件纪律
│
├─ B. 失败分类数据层(纯 TS,Promise 世界,零 runner 依赖)           [B 整支与 A、C1 并行]
│  ├─ B1. 词表与改名:`FailureScope` / `FailureClass`(替换 TurnErrorClass,含源码内
│  │      全部引用),包根导出 + `niceeval/adapter` 复导出;`AttemptFailureInfo` /
│  │      `AttemptFailureClassifier` 类型;`ExperimentDef.classifyFailure` schema 挂载
│  ├─ B2. 糖衣类 `ExperimentFatalError` / `EvalFatalError`(_tag + class 数据字段,
│  │      零 effect 依赖)+ `failureClassOf` 结构守卫(沿 cause 链取最外层命中)
│  │                                                              [依赖 B1]
│  ├─ B3. 分类链重排与决议:turn 链五道(抛出点 → 实验分类器 → adapter → 兜底 →
│  │      受理证据门,门只裁时间轴)、生命周期链三道(抛出点 → 实验分类器 → 缺省
│  │      不可重试,不挂产时间轴的兜底);分类器抛错按 undefined 回落;失败文本与
│  │      报错文案同源                                             [依赖 B1、B2]
│  └─ B4. provisioning 对外 scope 映射(sandbox resolve 层):凭据缺失/权限不足 →
│         experiment;模板不存在按 spec 有无 environments 表 → experiment / eval;
│         瞬时耗尽不附带 scope                                     [依赖 B1;与 B2/B3 并行]
│
├─ C. 派发脊柱流水线(src/runner/run.ts,内部严格串行——关键路径)
│  ├─ C1. 许可流水线改造                                           [依赖 A;不等 B,
│  │      halt 检查点先留桩(恒不落闸)]
│  │      把 gated/preflight/body 的嵌套 + preflight 前取锁,改成显式许可链:
│  │      止损闸检查(桩)→ 实验闸(gate-lease 替换 runSem,持有期语义不变:attempt
│  │      同生命周期、退避不释放)→ 全局位 → 派发时刻非阻塞试锁(成功即跑;撞新鲜锁
│  │      立刻还全局位、用例转 elsewhere 挂起,位子按瓶颈优先转派;runs>1 兄弟共享
│  │      memoized 锁:自己持有直接放行,别人持有全体挂起不重复试)→ preflight → body。
│  │      挂起用例心跳周期重读锁,释放/接管后重查携带(planCarry 逐 attempt):携入
│  │      elsewhere→reused,转自跑 elsewhere→queued 按原优先级排队。评估删除
│  │      caseLockAcquireMutex(取锁已在授位之后,不再影响抢位序,见 memory
│  │      case-lock-gate-reorders-global-semaphore-queue),不留无用机制
│  ├─ C2. 止损执行体接入                                           [依赖 C1、B3]
│  │      attempt 封口读终局失败的 scope → 落 eval 闸 / experiment 闸(Effect.makeLatch,
│  │      幂等、invocation 内不可逆、实验闸蕴含全部 eval 闸);C1 的桩换成真检查;等待
│  │      集中同闸 attempt 走既有 interruption 中止;未派发计 unstarted、完成状态
│  │      incomplete;dispatch-halted 诊断(scope/evalId,dedupeKey 折叠)走实验域诊断
│  │      通路,反馈流同源通知;teardown 边界(实验级 teardown 抛声明降级诊断、
│  │      per-attempt teardown 抛声明照常落闸不改 verdict);E = never 纪律不破——
│  │      scope 经封口读取,不走错误通道传播
│  └─ C3. 反馈面收口                                               [依赖 C2]
│        elsewhere 逐条流动下五项恒等式与迁移规则核对(cli.md 契约字面);lock_wait
│        起止事件回归;halted 通知渲染(human 一行 error 级 + --json 事件);重试
│        activity 行与耗尽摘要零回归
│
├─ T. 测试(只为已声明类别写测;各项依赖其对应实现节点,互相并行)
│  ├─ T1. gate-lease 单测:槽互斥(两进程恰一个取到)、min-N、心跳/过期/接管复用
│  │      锁纪律、释放路径                                          [依赖 A]
│  ├─ T2. 分类链与守卫单测(context 层):决议序(实验分类器与 adapter 同时认领时
│  │      scope 胜出的区分力场景)、failureClassOf cause 链穿透与结构识别、生命周期链
│  │      缺省、证据门只降时间轴、retryable+scope 被吸收不外泄/耗尽携带浮出
│  │                                                              [依赖 B3]
│  ├─ T3. runner 调度与止损测试:排队不持锁(锁目录条目数 ≤ 在跑数)、撞锁转派、
│  │      多开分工(两 runEvals 同 root:派发集不相交、并集覆盖、峰值可达上限之和)、
│  │      实验闸跨 runEvals(maxConcurrency:1 双 runEvals 峰值恒 1)、止损闸全类别
│  │      (触发/幂等/不可逆/不抢占/记账/teardown 边界/诊断双通路);既有回归全绿,
│  │      瓶颈优先那组连续 10 次防 flaky(踩坑见 memory 两条 case-lock 台账,
│  │      vi.advanceTimersByTimeAsync 分步推进)                     [依赖 C2(止损部分)、
│  │                                                               C1(锁部分可先行)]
│  └─ T4. provisioning scope 映射单测(fake SDK 注入,environments 表有/无两分支)
│                                                                 [依赖 B4]
│
└─ S. 收尾(严格串行,全树最后)
   ├─ S1. `pnpm run typecheck` + `pnpm test` 全绿;公开面变更(FailureClass、糖衣类、
   │      classifyFailure、failureClassOf 导出)跑 `pnpm docs:reference` 核对参考页区块,
   │      TSDoc 缺注释生成器会报错——文案单源写在源码紧邻注释
   ├─ S2. 真机冒烟(/Users/ctrdh/Code/MemoryBench,场景见「验收」1-5;后台任务
   │      ~1h 硬杀,批次拆小)
   └─ S3. 实现中发现的坑记 memory 台账并索引;可观察行为与 docs 逐条核对,
          有意留下的阶段性差异明确记录
```

并行度提示:β 泳道(B1→B2→B3、旁支 B4)整支不碰 run.ts,与 α 泳道(A→C1)完全无共享文件,适合双 worker 同时开工;多 worker 提交遵守 memory 的 parallel-agents-shared-git-index(路径限定 add 后立即提交)。C2 是唯一的汇合点(等 C1 与 B3 双完成)。

## 验收

1. **多开水平扩展**:双终端跑同一条命令(各 `--max-concurrency 2`,选择全量重叠)——两边面板都出现 `running > 0`,全局同时在跑接近 4 个 attempt;没有任何 (experiment, eval) 被真实派发两次;两边结束时都拿到完整结果集(`reused` 含对方跑完携入的部分);任何一帧五项计数恒等式成立。
2. **实验闸跨进程**:`maxConcurrency: 1` 的实验,双终端选不相交 eval 子集——同一时刻全局至多 1 个该实验的 attempt 在跑。
3. **强杀接管**:`kill -9` 一边——另一边 30s 内接管其用例锁与实验闸租约照常跑完,伴随去重后的 `lock-taken-over` warning;整批结束后 `.niceeval/locks/` 为空。
4. **实验级止损**:真机断掉共享服务——第一条撞死的 attempt 照常 `errored`(code 不变),反馈流一条 `experiment halted (dispatch-halted): <作者 message>`,余量计 `unstarted`、完成状态 `incomplete`,同批其它实验照常跑完;修复后重跑同一条命令只补跑死掉与没跑的部分。
5. **eval 级止损**:`EvalFatalError` 场景——只停本 eval 剩余 attempt,同实验其它 eval 不受影响;`snapshot.json` 的 `dispatch-halted` 诊断带 `data.evalId`。
6. **时间轴零回归**:限流批跑场景 activity 行 `turn retry n/4 (reason)` 照旧,重试成功零痕迹,耗尽摘要注明耗尽层;`--dry` 只读锁目录出 `locked` 标注、不取锁不等待。
7. **机器面**:`pnpm run typecheck` 与 `pnpm test` 全绿,瓶颈优先回归组连跑 10 次稳定;`pnpm docs:reference` 无漂移(`pnpm test` 的守护不红)。
