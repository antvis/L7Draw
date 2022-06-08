import { ICursor, SourceData } from '../typings';

/**
 * 鼠标指针默认值
 */
export const DEFAULT_CURSOR_MAP: ICursor = {
  draw: 'crosshair',
  pointHover: 'pointer',
  pointDrag: 'move',
  lineHover: 'pointer',
  lineDrag: 'move',
  polygonHover: 'pointer',
  polygonDrag: 'move',
};

export const DEFAULT_SOURCE_DATA: SourceData = {
  point: [],
  line: [],
  polygon: [],
  midPoint: [],
  dashLine: [],
  text: [],
};
