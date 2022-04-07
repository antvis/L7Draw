import { v4 } from 'uuid';
import { IBaseFeature } from '../typings';
import { Feature, lineString as turfLineString, Point } from '@turf/turf';
import { Position, Properties } from '@turf/turf';

export const getUuid = (prefix = '') => {
  return `${prefix}-${v4()}`;
};

export const isSameFeature = (
  feature1?: IBaseFeature | null,
  feature2?: IBaseFeature | null,
) => {
  return !!(
    feature1 &&
    feature2 &&
    feature1.properties?.id === feature2.properties?.id
  );
};

export const lineString = <P = Properties>(
  coordinates: Position[],
  properties?: P,
) => {
  const onlyOne = coordinates.length === 1;
  if (onlyOne) {
    coordinates.unshift([0, 0]);
  }
  const feature = turfLineString(coordinates, properties);
  if (onlyOne) {
    feature.geometry?.coordinates.shift();
  }
  return feature;
};

export const midPoint = <P>(
  point1: Feature<Point>,
  point2: Feature<Point>,
  properties: P | null = null,
) => {};

export * from './cursor';
