# PR 变更预览

NiceEval 的 PR Preview 同时提供产品运行结果与 Concord 变更审阅。产品页使用已验证的 Record；`/concord/` 展示该 PR 相对合并目标分支引入的文档与源码变化。

## 比较身份

Netlify deploy-preview 以 `REVIEW_ID` 定位 NiceEval PR，从 GitHub 取得实际的 base ref、base SHA 与 head SHA。head 必须等于本次 `COMMIT_REF`；不一致时拒绝构建，避免把移动后的 PR 内容标为当前候选。

目标分支可以是任意合法分支，不固定为 main。比较从 base/head 的唯一共同祖先到 head，目标分支自己的后续变化不混入 PR 差异。checkout 是 detached HEAD 或平台提供 merge commit 时，也必须使用已确认的 PR head。

获取缺失 Git 对象与历史属于 Preview contribution。Concord 只读取已取得的提交；浅历史或不存在的共同祖先不能触发默认分支回退。只读 GitHub 查询失败时明确失败，不把未知目标当作空变更。

## 构建与托管

Concord 使用仓库依赖中的固定包，包内容由 lockfile 绑定。本地验证和 CI 消费相同 CLI；不得依赖全局安装或相邻源码 checkout。

Preview contribution 调用 `concord view export`，显式传递 base SHA、head SHA、目标分支展示名与独占输出目录。导出完成后将目录纳入发布文件清单和摘要，校验通过才发布整个站点。

`concord/` 的静态 JSON 只接受 Concord 公布的严格 Schema，不扩大其它路径的 JSON 准入。差异阅读不调用 NiceEval Inspection Function，也不启动 Concord 的可编辑本地服务。

产品 Preview 的入口提供“PR 变更”链接，链接相对当前部署指向 `concord/`。该子目录使用相对资源与 hash 导航，深链接刷新不依赖本地服务 API 或服务器路由。

普通 production Preview 保持产品用途，不伪造 PR 身份。本地审阅显式指定 base/head，导出当前提交的内容，不包含工作区中的未提交改动。

## 验收

- 正式本地导出入口使用隔离 Git 消费者与已安装 Concord，验证非 main 目标、目标分支独有提交、脏工作树和重命名。
- 用浏览器打开 `/concord/`，核对身份、变更文件、正文与 diff；刷新和子路径静态资源有效。
- 目标缺失、head 漂移、未取得的对象、输出目录冲突与内容校验失败返回具名错误，保留未知文件。
- 构建收据包含 Concord 输出的实际文件及摘要；未部署的本地结果不能代替 Netlify 与 PR 的线上验收。
- 包更新、代码接线与文档检查通过仓库正式入口；push、发布与部署沿用用户授权边界。
