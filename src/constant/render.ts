import { IRenderType } from '../typings';
import { BaseRender, LineRender, PointRender } from '../render';

/**
 * renderType与render的映射
 */
export const RENDER_MAP: Record<
  IRenderType,
  typeof PointRender | typeof LineRender
> = {
  point: PointRender,
  line: LineRender,
  dashLine: LineRender,
  midPoint: PointRender,
};
