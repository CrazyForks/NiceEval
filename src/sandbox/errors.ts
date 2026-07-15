// 沙箱 provisioning 错误的中性分类:各 provider SDK 的限流错误形状互不相同(e2b 抛
// RateLimitError,vercel 抛 APIError{ response.status: 429 },docker 是 dockerode 的
// 普通 Error,message 里带 "toomanyrequests")。resolve.ts 的 createProvider() 据此统一
// 做退避重试,不需要认识任何 provider 专属的错误类型——分类逻辑留在各 provider 自己的
// 文件里(见 e2b.ts / vercel.ts / docker.ts 的 classifyProvisionError)。

/**
 * Provisioning 失败的两维分类(见 docs/feature/sandbox/architecture.md「Provisioning 失败与重试」):
 * **性质**(瞬时 / 确定性)决定要不要重试,**后果**(远端是否可能已创建实例)决定能不能直接重试。
 * - `rate_limit` / `rejected`:拒绝类——请求确定没被受理(限流、DNS/连接被拒/TLS 握手失败),
 *   直接指数退避重试。
 * - `ambiguous`:歧义类——请求可能已被受理、只是响应丢了(响应中途重置、请求超时、5xx),
 *   远端可能有一台正在计费的实例;重试前必须对账(provider 提供检索通道时),否则第一次抛出。
 * - `unknown`:确定性失败(模板不存在、凭据缺失、权限不足),第一次就抛,重试没有意义。
 * 分类器偏向宽认瞬时:误判成确定性会白白判死可自愈的 attempt;反向只多花封顶的退避时间。
 */
export type SandboxProvisionErrorKind = "rate_limit" | "rejected" | "ambiguous" | "unknown";

/** 拒绝类(含限流):请求确定没被受理,直接退避重试。 */
export function isRejectedProvisionError(kind: SandboxProvisionErrorKind): boolean {
  return kind === "rate_limit" || kind === "rejected";
}

/** 按 kind 判断是否可能重试(歧义类还需对账通道,见 retry.ts);unknown 第一次就抛。 */
export function isRetryableProvisionError(kind: SandboxProvisionErrorKind): boolean {
  return kind !== "unknown";
}

/**
 * 与文件 IO 重试共用的保守瞬时分类兜底:provider 没认出的错误按形态落进拒绝类或歧义类。
 * 连接建立失败(DNS / refused / TLS)= 拒绝类;响应中途重置 / 超时 / 5xx = 歧义类。
 */
export function classifyProvisionErrorFallback(error: unknown): SandboxProvisionErrorKind {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current != null; depth += 1) {
    const record = typeof current === "object" ? (current as Record<string, unknown>) : undefined;
    const message = current instanceof Error ? current.message : String(current);
    const status = provisionStatus(record);
    if (status === 429) return "rate_limit";
    if (status !== undefined && status >= 500 && status <= 599) return "ambiguous";
    const code = record && typeof record.code === "string" ? record.code : "";
    // 连接根本没建立:请求确定没被受理。
    if (/^(ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|CERT_|ERR_TLS)/i.test(code)) return "rejected";
    // 连接中途断掉 / 超时:请求可能已被受理。
    if (/^(ECONNRESET|EPIPE|ETIMEDOUT|UND_ERR_CONNECT_TIMEOUT|UND_ERR_SOCKET)$/i.test(code)) return "ambiguous";
    if (/getaddrinfo|connection refused|certificate|tls handshake/i.test(message)) return "rejected";
    if (/fetch failed|other side closed|socket hang up|connection (?:reset|closed)|timed? ?out|service unavailable|bad gateway|gateway timeout|\b50[0234]\b/i.test(message)) {
      return "ambiguous";
    }
    if (/too many requests|rate.?limit|\b429\b/i.test(message)) return "rate_limit";
    current = record?.cause;
  }
  return "unknown";
}

function provisionStatus(record: Record<string, unknown> | undefined): number | undefined {
  if (!record) return undefined;
  if (typeof record.status === "number") return record.status;
  if (typeof record.statusCode === "number") return record.statusCode;
  const response = record.response;
  if (response && typeof response === "object") {
    const status = (response as Record<string, unknown>).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

/**
 * 已创建 Sandbox 上单次文件 IO 的中性错误分类。这里描述的是传输层瞬时故障，
 * 不是文件不存在、权限不足、路径错误等确定性结果。
 */
export type SandboxIoErrorKind = "rate_limit" | "network" | "service_unavailable" | "unknown";

export function isRetryableSandboxIoError(kind: SandboxIoErrorKind): boolean {
  return kind !== "unknown";
}

/**
 * 内置 provider 与自定义 provider 共用的保守分类器。SDK 常把底层网络错误包在
 * `cause` 中，因此最多沿 cause 链向下检查几层；Abort/沙箱终止明确不重试。
 */
export function classifySandboxIoError(error: unknown): SandboxIoErrorKind {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current != null; depth += 1) {
    const record = typeof current === "object" ? current as Record<string, unknown> : undefined;
    const name = record && typeof record.name === "string" ? record.name : "";
    const message = current instanceof Error ? current.message : String(current);

    if (/abort|cancel|terminated|killed|sandbox.*(closed|stopped)/i.test(`${name} ${message}`)) return "unknown";

    const status = numericStatus(record);
    if (status === 429) return "rate_limit";
    if (status !== undefined && status >= 500 && status <= 599) return "service_unavailable";

    const code = record && typeof record.code === "string" ? record.code : "";
    if (/^(ECONNRESET|ECONNREFUSED|EPIPE|ETIMEDOUT|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|UND_ERR_CONNECT_TIMEOUT)$/i.test(code)) {
      return "network";
    }
    if (/fetch failed|socket hang up|network error|connection (?:reset|closed)|temporary failure|timed out while (?:fetching|uploading|downloading)/i.test(message)) {
      return "network";
    }
    if (/too many requests|rate.?limit|\b429\b/i.test(message)) return "rate_limit";
    if (/service unavailable|bad gateway|gateway timeout|\b50[0234]\b/i.test(message)) return "service_unavailable";

    current = record?.cause;
  }
  return "unknown";
}

function numericStatus(record: Record<string, unknown> | undefined): number | undefined {
  if (!record) return undefined;
  if (typeof record.status === "number") return record.status;
  if (typeof record.statusCode === "number") return record.statusCode;
  const response = record.response;
  if (response && typeof response === "object") {
    const status = (response as Record<string, unknown>).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}
