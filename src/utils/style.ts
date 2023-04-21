import { DeepPartial, IStyle } from '../typings';

/**
 * 获取单个颜色的 style 供 draw 实例使用
 * @param color
 * @returns
 */
export function getSingleColorStyle(color: string): DeepPartial<IStyle> {
  return {
    point: {
      normal: { color },
      hover: { color },
      active: { color },
    },
    line: {
      normal: { color },
      hover: { color },
      active: { color },
    },
    polygon: {
      normal: { color },
      hover: { color },
      active: { color },

      style: {
        // @ts-ignore
        opacity: 0.2,
      },
    },
    text: {
      normal: { color },
      active: { color },
    },
    midPoint: {
      normal: { color },
    },
    dashLine: {
      normal: { color },
    },
  };
}
