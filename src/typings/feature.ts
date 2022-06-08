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

// 点类型
export interface IPointProperties extends IBaseProperties {
  isHover?: boolean;
  isActive?: boolean;
  isDrag?: boolean;
  createTime: number;
}

export type IPointFeature = IBaseFeature<Point, IPointProperties>;

// 线类型
export interface ILineProperties extends IBaseProperties {
  nodes: IPointFeature[];
  isHover?: boolean;
  isActive?: boolean;
  isDrag?: boolean;
  isDraw?: boolean;
  createTime: number;
}

export type ILineFeature = IBaseFeature<LineString, ILineProperties>;

// 面类型
export interface IPolygonProperties extends IBaseProperties {
  nodes: IPointFeature[];
  line: ILineFeature;
  isHover?: boolean;
  isActive?: boolean;
  isDrag?: boolean;
  isDraw?: boolean;
  createTime: number;
}

export type IPolygonFeature = IBaseFeature<Polygon, IPolygonProperties>;

// 中点Feature Properties类型
export interface IMidPointProperties extends IBaseProperties {
  startId: string;
  endId: string;
}

// 中点Feature类型
export type IMidPointFeature = IBaseFeature<Point, IMidPointProperties>;

// 虚线Feature类型
export type IDashLineFeature = IBaseFeature<LineString, IBaseProperties>;

// 文本Feature Properties类型
export interface ITextProperties extends IBaseProperties {
  type: 'distance' | 'totalDistance' | 'dash' | 'area';
  text: string;
  meters: number;
  isActive: boolean;
}

// 文本Feature类型
export type ITextFeature = IBaseFeature<Point, ITextProperties>;

export type FeatureUpdater<F extends IBaseFeature> =
  | F[]
  | ((newFeatures: F[]) => F[]);
