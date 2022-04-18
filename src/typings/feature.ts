import {
  Feature,
  GeometryObject,
  LineString,
  Point,
  Polygon,
  Position,
} from '@turf/turf';

export interface IBaseProperties {
  id: string;
}

// @ts-ignore
export interface IBaseFeature<
  G extends GeometryObject = GeometryObject,
  P extends IBaseProperties = IBaseProperties
> extends Feature {
  type: 'Feature';
  geometry: G;
  properties: P;
}

// ------------

export interface IPointProperties extends IBaseProperties {
  isHover: boolean;
  isActive: boolean;
  isDrag: boolean;
}

export type IPointFeature = IBaseFeature<Point, IPointProperties>;

// ------------

export interface ILineProperties extends IBaseProperties {
  nodes: IPointFeature[];
  isHover: boolean;
  isActive: boolean;
  isDrag: boolean;
  isDraw: boolean;
}

export type ILineFeature = IBaseFeature<LineString, ILineProperties>;

// ------------

export interface IPolygonProperties extends IBaseProperties {
  nodes: Position[];
}

export type IPolygonFeature<
  P extends IBaseProperties = IBaseProperties
> = IBaseFeature<Polygon, P>;

export interface IMidPointProperties extends IBaseProperties {
  startId: string;
  endId: string;
}

export type IMidPointFeature = IBaseFeature<Point, IMidPointProperties>;

export type IDashLineFeature = IBaseFeature<LineString, any>;
// ------------

export interface ITextProperties extends IBaseProperties {
  text: string;
}

export type ITextFeature = IBaseFeature<Point, ITextProperties>;
