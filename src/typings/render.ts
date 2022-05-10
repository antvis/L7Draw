import { ILayer } from '@antv/l7';
import { IBaseFeature } from './feature';

export type IRenderType =
  | 'point'
  | 'line'
  | 'polygon'
  | 'midPoint'
  | 'dashLine'
  | 'text';

export interface IBaseStyle<P = any> {
  normal: P;
  callback?: (layers: ILayer[]) => void; // 初始化图层之后的回调
}

export interface IPointStyleItem {
  color: string;
  shape: string;
  size: number;
  borderWidth: number;
  borderColor: string;
}

export type IPointStyle = IBaseStyle<IPointStyleItem> & {
  hover: IPointStyleItem;
  active: IPointStyleItem;
  style: any;
};

export interface ILineStyleItem {
  color: string;
  size: number;
}

export type ILineStyle = IBaseStyle<ILineStyleItem> & {
  hover: ILineStyleItem;
  active: ILineStyleItem;
  style: any;
};

export interface IPolygonStyleItem {
  color: string;
}

export type IPolygonStyle = IBaseStyle<IPolygonStyleItem> & {
  hover: IPolygonStyleItem;
  active: IPolygonStyleItem;
  style: any;
};

export type IMidPointStyleItem = IPointStyleItem;

export type IMidPointStyle = IBaseStyle<IMidPointStyleItem>;

export type IDashLineStyle = IBaseStyle<ILineStyleItem> & {
  style: any;
};

export interface ITextStyleItem {
  color: string;
  size: number;
  borderWidth: number;
  borderColor: string;
}

export type ITextStyle = IBaseStyle<ITextStyleItem> & {
  active: ITextStyleItem;
  style: any;
};

export interface IStyle {
  point: IPointStyle;
  line: ILineStyle;
  polygon: IPolygonStyle;
  midPoint: IMidPointStyle;
  dashLine: IDashLineStyle;
  text: ITextStyle;
}

export interface IRenderOptions<D extends IBaseFeature, S extends IBaseStyle> {
  style: S;
}
