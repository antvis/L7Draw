import {
  ILineHelperOptions,
  IPointHelperOptions,
  IPolygonHelperOptions,
  IDragPolygonHelperOptions,
} from '../typings';

export const DEFAULT_POINT_HELPER_CONFIG: IPointHelperOptions = {
  draw: '单击绘制点',
  pointHover: '可拖拽调整点位置',
  pointDrag: '',
};

export const DEFAULT_LINE_HELPER_CONFIG: ILineHelperOptions = {
  draw: '单击绘制首个节点',
  pointHover: '可拖拽调整节点位置',
  pointDrag: '',
  lineHover: '可拖拽调整线位置',
  lineDrag: '',
  midPointHover: '单击在该位置新增节点',
  drawFinish: '单击继续绘制，双击结束绘制',
};

export const DEFAULT_POLYGON_HELPER_CONFIG: IPolygonHelperOptions = {
  draw: '单击绘制首个节点',
  drawContinue: '单击继续绘制',
  drawFinish: '单击继续绘制，双击结束绘制',
  midPointHover: '单击在该位置新增节点',
  pointHover: '可拖拽调整节点位置',
  pointDrag: '',
  lineHover: '可拖拽调整面位置',
  lineDrag: '',
  polygonHover: '可拖拽调整面位置',
  polygonDrag: '',
};

export const DEFAULT_DRAG_POLYGON_HELPER_CONFIg: IDragPolygonHelperOptions = {
  ...DEFAULT_POLYGON_HELPER_CONFIG,
  draw: '单击绘制首个节点',
  drawFinish: '单击结束绘制',
};

export const DEFAULT_TRIGGER_DRAG_HELPER_CONFIG: Partial<IDragPolygonHelperOptions> =
  {
    draw: '拖拽开始绘制',
    drawFinish: '松开鼠标结束绘制',
  };

export const DEFAULT_RECT_HELPER_CONFIG: Partial<IDragPolygonHelperOptions> = {
  lineHover: '可拖拽调整矩形位置',
  polygonHover: '可拖拽调整矩形位置',
};

export const DEFAULT_CIRCLE_HELPER_CONFIG: Partial<IDragPolygonHelperOptions> =
  {
    lineHover: '可拖拽调整圆位置',
    polygonHover: '可拖拽调整圆位置',
  };
