import {ICursor, IRenderType, ISourceData} from '../typings';
import {LineRender, PointRender, PolygonRender} from '../render';

export const DEFAULT_CURSOR_MAP: ICursor = {
  draw: 'crosshair',
  pointHover: 'pointer',
  pointDrag: 'move',
  lineHover: 'pointer',
  lineDrag: 'move',
  polygonHover: 'pointer',
  polygonDrag: 'move',
};

export const RENDER_TYPE_MAP: Record<
  IRenderType,
  typeof PolygonRender | typeof LineRender | typeof PointRender
> = {
  point: PointRender,
  line: LineRender,
  polygon: PolygonRender,
  midPoint: PointRender,
  dashLine: LineRender,
};

export const DEFAULT_SOURCE_DATA: ISourceData = {
  point: [],
  line: [],
  polygon: [],
  midPoint: [],
  dashLine: [],
  text: [],
};
