import { v4 } from 'uuid';
import {
  IBaseFeature,
  ILineFeature,
  ILineProperties,
  ILngLat,
  IMidPointFeature,
  IPointFeature,
  IPointProperties,
  IPolygonFeature,
  IPolygonProperties,
} from '../typings';
import {
  booleanClockwise,
  center,
  coordAll,
  distance,
  Feature,
  featureCollection,
  lineString,
  LineString,
  point,
  Point,
  Polygon,
  Position,
  Properties,
  rhumbBearing,
  transformTranslate,
} from '@turf/turf';
import { debounce, first, isEqual, last } from 'lodash';

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

export const createLineString = (
  position: Position,
  properties: ILineProperties,
) => {
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'LineString',
      coordinates: [position],
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

/**
 * 将polygonFeatures
 * @param feature
 */
export const syncPolygonNodes = (feature: IPolygonFeature) => {
  const nodes = feature.properties.nodes;
  const positions = coordAll(featureCollection(nodes));
  if (!isEqual(first(positions), last(positions))) {
    positions.push(first(positions)!);
  }
  feature.geometry.coordinates[0] = booleanClockwise(lineString(positions))
    ? positions
    : positions.reverse();
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

export const transformPointFeature = (
  feature: Feature<Point>,
  useDefault = false,
) => {
  const defaultProperties: IPointProperties = {
    id: getUuid('point'),
    isHover: false,
    isActive: false,
    isDrag: false,
    createTime: Date.now(),
  };
  feature.properties = useDefault
    ? defaultProperties
    : Object.assign(defaultProperties, feature.properties);
  return feature as IPointFeature;
};

export const transformLineFeature = (
  feature: Feature<LineString>,
  useDefault = false,
) => {
  const defaultProperties: ILineProperties = {
    id: getUuid('line'),
    isActive: false,
    isDrag: false,
    isDraw: false,
    isHover: false,
    nodes: [],
    createTime: Date.now(),
  };
  if (!feature.properties?.nodes?.length && feature.geometry) {
    defaultProperties.nodes = feature.geometry.coordinates.map(
      (position: Position) => {
        return transformPointFeature(point(position));
      },
    );
  }
  feature.properties = useDefault
    ? defaultProperties
    : Object.assign(defaultProperties, feature.properties);
  return feature as ILineFeature;
};

export const transformPolygonFeature = (
  feature: Feature<Polygon>,
  useDefault = false,
) => {
  // @ts-ignore
  const defaultProperties: IPolygonProperties = {
    id: getUuid('polygon'),
    isHover: false,
    isActive: false,
    isDrag: false,
    isDraw: false,
    createTime: Date.now(),
  };
  if (!feature.properties?.line) {
    defaultProperties.line = transformLineFeature(
      lineString(coordAll(feature)),
    );
  }
  if (!feature.properties?.nodes?.length) {
    defaultProperties.nodes = defaultProperties.line.properties.nodes ?? [];
  }
  feature.properties = useDefault
    ? defaultProperties
    : Object.assign(defaultProperties, feature.properties);
  return feature as IPolygonFeature;
};

export * from './cursor';
