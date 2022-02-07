/**
 * 赋予参数对象T深度可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
