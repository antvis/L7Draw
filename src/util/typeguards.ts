import { Feature, LineString, Point, Polygon } from '@turf/helpers';

export const isLineString = (
  feature: Feature,
): feature is Feature<LineString> => {
  return feature.geometry.type === 'LineString';
};

export const isPoint = (feature: Feature): feature is Feature<Point> => {
  return feature.geometry.type === 'Point';
};

export const isPolygon = (feature: Feature): feature is Feature<Polygon> => {
  return feature.geometry.type === 'Polygon';
};
