import {
  Feature,
  GeometryObject,
  LineString,
  Point,
  Polygon,
} from '@turf/turf';

export interface IBaseProperties {
  id: string;
}

// @ts-ignore
export interface IBaseFeature<
  G extends GeometryObject = GeometryObject,
  P extends IBaseProperties = IBaseProperties,
> extends Feature {
  type: 'Feature';
  geometry: G;
  properties: P;
}

// ------------

export interface IPointProperties extends IBaseProperties {
  isHover?: boolean;
  isActive?: boolean;
  isDrag?: boolean;
  createTime?: number;
}

export type IPointFeature = IBaseFeature<Point, IPointProperties>;

// ------------

export interface ILineProperties extends IBaseProperties {
  nodes: IPointFeature[];
  isHover?: boolean;
  isActive?: boolean;
  isDrag?: boolean;
  isDraw?: boolean;
  createTime?: number;
}

export type ILineFeature = IBaseFeature<LineString, ILineProperties>;

// ------------

export interface IPolygonProperties extends IBaseProperties {
  nodes: IPointFeature[];
  line: ILineFeature;
  isHover?: boolean;
  isActive?: boolean;
  isDrag?: boolean;
  isDraw?: boolean;
  createTime?: number;
}

export type IPolygonFeature = IBaseFeature<Polygon, IPolygonProperties>;

export interface IMidPointProperties extends IBaseProperties {
  startId: string;
  endId: string;
}

export type IMidPointFeature = IBaseFeature<Point, IMidPointProperties>;

export type IDashLineFeature = IBaseFeature<LineString, any>;
// ------------

export interface ITextProperties extends IBaseProperties {
  text: string;
  isActive: boolean;
}

export type ITextFeature = IBaseFeature<Point, ITextProperties>;