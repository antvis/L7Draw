import { IRenderType } from '../typings';
import { LineRender, PointRender, TextRender, MidPointRender } from '../render';

/**
 * renderType与render的映射
 */
export const RENDER_MAP: Record<
  IRenderType,
  | typeof PointRender
  | typeof LineRender
  | typeof MidPointRender
  | typeof TextRender
> = {
  point: PointRender,
  line: LineRender,
  dashLine: LineRender,
  midPoint: MidPointRender,
  text: TextRender,
};
