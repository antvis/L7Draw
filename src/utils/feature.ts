import {
  Position,
  booleanClockwise,
  coordAll,
  featureCollection,
  lineString,
} from '@turf/turf';
import {
  ILineFeature,
  ILineProperties,
  IPolygonFeature,
  IPolygonProperties,
} from '../typings';
import { first, isEqual, last } from 'lodash';

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
 * 将 polygon 当前的properties.nodes数据同步到 geometry 和 line上
 * @param feature
 */
export const syncPolygonNodes = (feature: IPolygonFeature) => {
  const nodes = feature.properties.nodes;
  const positions = coordAll(featureCollection(nodes));
  const firstPosition = first(positions);
  if (!isEqual(firstPosition, last(positions))) {
    positions.push(firstPosition!);
  }
  if (!feature.properties.isDraw) {
    const lineFeature = feature.properties.line;
    const lineNodes = lineFeature.properties.nodes;
    const firstLineNode = first(lineNodes);
    const lastLineNode = last(lineNodes);
    if (firstLineNode && lastLineNode && firstPosition) {
      firstLineNode.geometry.coordinates = lastLineNode.geometry.coordinates =
        firstPosition;
    }
    lineFeature.geometry.coordinates = coordAll(featureCollection(lineNodes));
  }
  feature.geometry.coordinates[0] = booleanClockwise(lineString(positions))
    ? positions
    : positions.reverse();
};
