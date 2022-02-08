import {
  Feature,
  Point,
  LineString,
  Polygon,
  GeometryObject,
} from '@turf/turf';

export interface IBaseProperties {
  id: string;
  isEdit: boolean;
}

export type IBaseFeature<
  T extends GeometryObject = GeometryObject,
  P extends IBaseProperties = IBaseProperties,
> = Feature<T, P>;

export type IPointFeature<P extends IBaseProperties = IBaseProperties> =
  IBaseFeature<Point, P>;

export type ILineFeature<P extends IBaseProperties = IBaseProperties> =
  IBaseFeature<LineString, P>;

export type IPolygonFeature<P extends IBaseProperties = IBaseProperties> =
  IBaseFeature<Polygon, P>;
