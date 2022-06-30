import { ILayer, ILayerConfig } from '@antv/l7';

/**
 * Style的基类
 */
export interface IBaseStyle<ItemType = any> {
  options?: Partial<ILayerConfig>;
  normal: ItemType;
  style?: any;
  callback?: (layers: ILayer[]) => void; // 初始化图层之后的回调
}

export interface IComplexStyle<ItemType = any> extends IBaseStyle<ItemType> {
  hover: ItemType;
  active: ItemType;
}

/**
 * Point的单个Style项
 */
export interface IPointStyleItem {
  color: string;
  shape: string;
  size: number;
  // borderWidth: number;
  borderColor: string;
}

/**
 * 整个Style类型
 */
export type IPointStyle = IComplexStyle<IPointStyleItem>;

/**
 *
 */
export interface ILineStyleItem {
  color: string;
  size: number;
}

export type ILineStyle = IComplexStyle<ILineStyleItem>;

export interface IPolygonStyleItem {
  color: string;
}

export type IPolygonStyle = IComplexStyle<IPolygonStyleItem>;

export type IMidPointStyleItem = IPointStyleItem;

export type IMidPointStyle = IBaseStyle<IMidPointStyleItem>;

export type IDashLineStyle = IBaseStyle<ILineStyleItem>;

export type ITextStyleItem = Omit<IPointStyleItem, 'shape'>;

export type ITextStyle = IBaseStyle<ITextStyleItem> & {
  active: ITextStyleItem;
};

export interface IStyle {
  point: IPointStyle;
  line: ILineStyle;
  polygon: IPolygonStyle;
  midPoint: IMidPointStyle;
  dashLine: IDashLineStyle;
  text: ITextStyle;
}
