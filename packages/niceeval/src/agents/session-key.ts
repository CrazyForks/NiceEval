declare const sessionKeyValue: unique symbol;

/**
 * Adapter 私有的会话状态键。运行时只用 `key` 的 symbol 身份寻址；
 * 非导出品牌让 `T` 在编译期保持不变，不同值类型的 key 不能互换。
 */
export interface SessionKey<T> {
  readonly key: symbol;
  readonly [sessionKeyValue]: (value: T) => T;
}

/** 创建一个按 symbol 身份隔离的 Adapter 私有会话状态键。 */
export function createSessionKey<T>(name: string): SessionKey<T> {
  return { key: Symbol(name) } as SessionKey<T>;
}
