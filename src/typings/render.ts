import {
  Feature,
  Point,
  LineString,
  Polygon,
  GeometryObject,
  Position,
} from '@turf/turf';
import { ILayer } from '@antv/l7';

export type IRenderType =
  | 'point'
  | 'line'
  | 'polygon'
  | 'midPoint'
  | 'dashLine';

export interface IBaseStyleItem {
  color: string;
}

export interface IBaseStyle<P extends IBaseStyleItem = IBaseStyleItem> {
  normal: P;
  hover: P;
  active: P;

  callback?: (layers: ILayer[]) => void; // 初始化图层之后的回调
}

export interface IPointStyleItem extends IBaseStyleItem {
  shape: string;
  size: number;
  borderWidth: number;
  borderColor: string;
}

export type IPointStyle = IBaseStyle<IPointStyleItem>;

export interface ILineStyleItem extends IBaseStyleItem {
  size: number;
  dash: boolean;
}

export type ILineStyle = IBaseStyle<ILineStyleItem>;

export interface IPolygonStyleItem extends IBaseStyleItem {}

export type IPolygonStyle = IBaseStyle<IPolygonStyleItem>;

export interface IMidPointStyleItem extends IPointStyleItem {}

export type IMidPointStyle = IBaseStyle<IMidPointStyleItem>;

export interface IStyle {
  point: IPointStyle;
  line: ILineStyle;
  polygon: IPolygonStyle;
  midPoint: IMidPointStyle;
  dashLine: ILineStyle;
}

export interface IBaseProperties {
  id: string;
  isHover: boolean;
  isActive: boolean;
  isDrag: boolean;
}

export type IBaseFeature<
  T extends GeometryObject = GeometryObject,
  P extends IBaseProperties = IBaseProperties
> = Feature<T, P>;

// ------------

export interface IPointProperties extends IBaseProperties {}

export type IPointFeature = IBaseFeature<Point, IPointProperties>;

// ------------

export interface ILineProperties extends IBaseProperties {}

export type ILineFeature = IBaseFeature<LineString, ILineProperties>;

// ------------

export interface IPolygonProperties extends IBaseProperties {
  nodes: Position[];
}

export type IPolygonFeature<
  P extends IBaseProperties = IBaseProperties
> = IBaseFeature<Polygon, P>;

export type IMidPointFeature<
  P extends IBaseProperties = IBaseProperties
> = IBaseFeature<Point, P>;

// ------------

export interface IRenderOptions<D extends IBaseFeature, S extends IBaseStyle> {
  style: S;
}
