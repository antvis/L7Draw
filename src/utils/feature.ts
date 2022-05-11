import {
  Position,
  point,
} from '@turf/turf';
import {
  ILineFeature,
  ILineProperties,
  ILngLat,
  IPointFeature,
  IPolygonFeature,
  IPolygonProperties,
} from '../typings';
import { getUuid } from './common';

export const createPointFeature = ({ lng, lat }: ILngLat) => {
  return point([lng, lat], {
    id: getUuid('point'),
    isHover: false,
    isActive: true,
    isDrag: false,
    createTime: Date.now(),
  }) as IPointFeature;
};

export const createLineString = (
  positions: Position[],
  properties: ILineProperties,
) => {
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'LineString',
      coordinates: positions,
    },
  } as ILineFeature;
};

export const createPolygon = (
  position: Position,
  properties: IPolygonProperties,
) => {
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'Polygon',
      coordinates: [[position, position]],
    },
  } as IPolygonFeature;
};
