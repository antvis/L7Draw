import {
  ILineHelperOptions,
  IPointHelperOptions,
  IPolygonHelperOptions,
  // IRectHelperOptions,
} from '../typings';

export const DEFAULT_POINT_HELPER_CONFIG: IPointHelperOptions = {
  draw: '单击绘制点',
  pointHover: '可拖拽调整点位置',
  pointDrag: '',
};

export const DEFAULT_LINE_HELPER_CONFIG: ILineHelperOptions = {
  draw: '单击绘制首个顶点',
  pointHover: '可拖拽调整节点位置',
  pointDrag: '',
  lineHover: '可拖拽调整线位置',
  lineDrag: '',
  midPointHover: '单击在该位置新增节点',
  drawFinish: '双击结束绘制',
};

export const DEFAULT_POLYGON_HELPER_CONFIG: IPolygonHelperOptions = {
  draw: '单击绘制首个顶点',
  drawFinish: '双击结束绘制',
  midPointHover: '单击在该位置新增节点',
  pointHover: '可拖拽调整节点位置',
  pointDrag: '',
  lineHover: '可拖拽调整面位置',
  lineDrag: '',
  polygonHover: '可拖拽调整面位置',
  polygonDrag: '',
};
