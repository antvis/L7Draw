import {
  Feature,
  Point,
  LineString,
  Polygon,
  GeometryObject,
  Position,
} from '@turf/turf';

export type IRenderType = 'point' | 'line' | 'polygon' | 'midPoint';

export interface IBaseStyle {
  color: string;
}

export interface IBaseStyleItem<P extends IBaseStyle = IBaseStyle> {
  normal: P;
  hover: P;
  active: P;
}

export interface IPointStyleItem extends IBaseStyle {
  shape: string;
  size: number;
  borderWidth: number;
  borderColor: string;
}

export type IPointStyle = IBaseStyleItem<IPointStyleItem>;

export interface ILineStyleItem extends IBaseStyle {
  size: number;
  dashed: boolean;
}

export type ILineStyle = IBaseStyleItem<ILineStyleItem>;

export interface IPolygonStyleItem extends IBaseStyle {}

export type IPolygonStyle = IBaseStyleItem<IPolygonStyleItem>;

export interface IMidPointStyleItem extends IPointStyleItem {}

export type IMidPointStyle = IBaseStyleItem<IMidPointStyleItem>;

export interface IStyle {
  point: IPointStyle;
  line: ILineStyle;
  polygon: IPolygonStyle;
  midPoint: IMidPointStyle;
}

export interface IBaseProperties {
  id: string;
  isHover: boolean;
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
  pointIds: string[];
  isDrawing: boolean;
}

export type ILineFeature = IBaseFeature<LineString, ILineProperties>;

// ------------

export interface IPolygonProperties extends IBaseProperties {
  nodes: Position[];
}

export type IPolygonFeature<P extends IBaseProperties = IBaseProperties> =
  IBaseFeature<Polygon, P>;

export type IMidPointFeature<P extends IBaseProperties = IBaseProperties> =
  IBaseFeature<Point, P>;

// ------------

export interface IRenderOptions<
  D extends IBaseFeature,
  S extends IBaseStyleItem,
> {
  style: S;
}
