import { IRenderType } from '../typings';
import {
  LineRender,
  PointRender,
  TextRender,
  MidPointRender,
  PolygonRender,
  DashLineRender,
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
  | typeof DashLineRender
> = {
  point: PointRender,
  line: LineRender,
  dashLine: DashLineRender,
  midPoint: MidPointRender,
  text: TextRender,
  polygon: PolygonRender,
};
