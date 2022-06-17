import {
  DashLineRender,
  LineRender,
  MidPointRender,
  PointRender,
  PolygonRender,
  TextRender,
} from '../render';
import { IRenderType } from '../typings';

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
  | typeof DashLineRender
> = {
  point: PointRender,
  line: LineRender,
  dashLine: DashLineRender,
  midPoint: MidPointRender,
  text: TextRender,
  polygon: PolygonRender,
};
