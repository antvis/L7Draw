import {
  Feature,
  Point,
  LineString,
  Polygon,
  GeometryObject,
  Position,
} from '@turf/turf';

export type IRenderType = 'point' | 'line' | 'polygon';

export interface IBaseStyle {
  color: string;
}

export interface IStyleItem<P extends IBaseStyle = IBaseStyle> {
  normal: P;
  active: P;
}

export interface IPointStyleItem extends IBaseStyle {
  size: number;
  innerSize: number;
  innerColor: string;
}

export type IPointStyle = IStyleItem<IPointStyleItem>;

export interface ILineStyleItem extends IBaseStyle {
  size: number;
  dashed: boolean;
}

export type ILineStyle = IStyleItem<ILineStyleItem>;

export interface IPolygonStyleItem extends IBaseStyle {}

export type IPolygonStyle = IStyleItem<IPolygonStyleItem>;

export interface IStyle {
  point: IPointStyle;
  line: ILineStyle;
  polygon: IPolygonStyle;
}

export interface IBaseProperties {
  id: string;
  isActive: boolean;
}

export type IBaseFeature<
  T extends GeometryObject = GeometryObject,
  P extends IBaseProperties = IBaseProperties,
> = Feature<T, P>;

// ------------

export interface IPointProperties extends IBaseProperties {}

export type IPointFeature = IBaseFeature<Point, IPointProperties>;

// ------------

export interface ILineProperties extends IBaseProperties {
  nodes: Position[];
}

export type ILineFeature = IBaseFeature<LineString, ILineProperties>;

// ------------

export interface IPolygonProperties extends IBaseProperties {
  nodes: Position[];
}

export type IPolygonFeature<P extends IBaseProperties = IBaseProperties> =
  IBaseFeature<Polygon, P>;

// ------------

export interface IRenderOptions<D extends IBaseFeature, S extends IStyleItem> {
  style: S;
}
