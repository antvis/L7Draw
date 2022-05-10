import {
  coordAll,
  Feature,
  lineString,
  LineString,
  point,
  Point,
  Polygon,
  Position,
} from '@turf/turf';
import {
  ILineFeature,
  ILineProperties,
  IPointFeature,
  IPointProperties,
  IPolygonFeature,
  IPolygonProperties,
} from '../typings';
import { getUuid } from './common';

/**
 * 初始化 Point 数据，会自动注入相应properties
 * @param feature
 * @param useDefault
 */
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

/**
 * 初始化 LineString 数据，会自动注入相应properties
 * @param feature
 * @param useDefault
 */
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

/**
 * 初始化 Polygon 数据，会自动注入相应properties
 * @param feature
 * @param useDefault
 */
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
    defaultProperties.line.properties.isActive = !!feature.properties?.isActive;
  }
  if (!feature.properties?.nodes?.length) {
    const lineNodes = defaultProperties.line.properties.nodes ?? [];
    defaultProperties.nodes = lineNodes.length
      ? lineNodes.slice(0, lineNodes.length - 1)
      : [];
  }
  feature.properties = useDefault
    ? defaultProperties
    : Object.assign(defaultProperties, feature.properties);
  return feature as IPolygonFeature;
};
