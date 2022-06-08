import { IRenderType } from '../typings';
import {
  LineRender,
  PointRender,
  TextRender,
  MidPointRender,
  PolygonRender,
} from '../render';

/**
 * renderType与render的映射
 */
export const RENDER_MAP: Record<
  IRenderType,
  | typeof PointRender
  | typeof LineRender
  | typeof MidPointRender
  | typeof TextRender
  | typeof PolygonRender
> = {
  point: PointRender,
  line: LineRender,
  dashLine: LineRender,
  midPoint: MidPointRender,
  text: TextRender,
  polygon: PolygonRender,
};
