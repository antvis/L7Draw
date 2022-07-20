import {
  DrawPoint,
  DrawLine,
  DrawPolygon,
  DrawCircle,
  DrawRect,
} from '../drawer';
import { BtnType, DrawType } from './types';

export const DrawIconMap: Record<BtnType, string> = {
  point: '#l7draw-point',
  line: '#l7draw-line',
  polygon: '#l7draw-polygon',
  rect: '#l7draw-rect',
  circle: '#l7draw-circle',
  clear: '#l7draw-qingkong',
};

export const DrawInstanceMap: Record<DrawType, any> = {
  point: DrawPoint,
  line: DrawLine,
  polygon: DrawPolygon,
  rect: DrawRect,
  circle: DrawCircle,
};

export const DrawTypeAttrName = 'data-draw-type';

export const DrawControlClassName = 'l7-draw-control';

export const DrawBtnClassName = `${DrawControlClassName}__btn`;

export const DrawBtnActiveClassName = `${DrawBtnClassName}--active`;
