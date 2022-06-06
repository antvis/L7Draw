import { IRenderType } from '../typings';
import { BaseRender, PointRender } from '../render';

/**
 * renderType与render的映射
 */
export const RENDER_MAP: Record<IRenderType, typeof PointRender> = {
  point: PointRender,
};
