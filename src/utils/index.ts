import { v4 } from 'uuid';
import {
  IBaseFeature,
  ILineFeature,
  ILngLat,
  IMidPointFeature,
} from '../typings';
import {
  center,
  distance,
  Feature,
  featureCollection,
  lineString as turfLineString,
  point,
  Point,
  rhumbBearing,
  transformTranslate,
} from '@turf/turf';
import { Position, Properties } from '@turf/turf';
import { debounce } from 'lodash';

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

export const moveFeature = <F extends IBaseFeature>(
  feature: F,
  startLngLat: ILngLat,
  endLngLat: ILngLat,
) => {
  const { lng: lng1, lat: lat1 } = startLngLat;
  const { lng: lng2, lat: lat2 } = endLngLat;

  const startPoint = point([lng1, lat1]);
  const endPoint = point([lng2, lat2]);

  const between = distance(startPoint, endPoint, {
    units: 'meters',
  });

  const angle = rhumbBearing(startPoint, endPoint);

  // @ts-ignore
  return transformTranslate(feature, between, angle, {
    units: 'meters',
  }) as F;
};

export const moveFeatureList = <F extends IBaseFeature>(
  features: F[],
  startLngLat: ILngLat,
  endLngLat: ILngLat,
) => {
  return features.map(feature => moveFeature(feature, startLngLat, endLngLat));
};

export const debounceMoveFn = (f: Function) => {
  // @ts-ignore
  return debounce(f, 16, {
    maxWait: 16,
  });
};

export const calcMidPointList = (feature: ILineFeature) => {
  const { nodes } = feature.properties;
  const midPointList: IMidPointFeature[] = [];
  for (let index = 0; index < nodes.length - 1; index++) {
    const newMidPoint = center(
      featureCollection([nodes[index], nodes[index + 1]]),
      {
        properties: {
          id: getUuid('midPoint'),
          startId: nodes[index].properties?.id ?? '',
          endId: nodes[index + 1].properties?.id ?? '',
        },
      },
    ) as IMidPointFeature;
    midPointList.push(newMidPoint);
  }
  return midPointList;
};

export * from './cursor';
