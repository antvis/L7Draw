import {
  AdsorbTargetFeature,
  AdsorbResult,
  IAdsorbOptions,
  IPointFeature,
  ILineFeature,
} from '../typings';
import { LineMode, PolygonMode } from '../mode';
import {
  coordAll,
  Feature,
  featureCollection,
  getType,
  lineString,
  LineString,
  nearestPointOnLine,
  point,
  Point,
  Polygon,
  polygonToLine,
  Position,
} from '@turf/turf';
import { Scene } from '@antv/l7';
import { findMinIndex, splitByPosition } from './common';
import { eq, isEqual } from 'lodash';

/**
 * 获取当前数据对应的吸附点、线数组
 * @param adsorbDataConfig
 * @param draw
 * @param position
 */
export const getAdsorbFeature: (
  adsorbDataConfig: IAdsorbOptions['data'],
  draw: LineMode<any> | PolygonMode<any>,
  position: Position,
) => AdsorbResult = (adsorbDataConfig, draw, position) => {
  let features: AdsorbTargetFeature[] = [];
  let adsorbPoints: Feature<Point>[] = [];
  let adsorbLines: Feature<LineString>[] = [];
  if (adsorbDataConfig === 'drawData') {
    features = draw.getData();
  } else if (adsorbDataConfig instanceof Function) {
    features = adsorbDataConfig(position);
  } else {
    features = adsorbDataConfig;
  }
  if (features.length) {
    adsorbPoints = features
      .map((feature) => {
        const { nodes = [], isActive = false } = feature.properties ?? {};
        return isActive
          ? nodes.filter((node: IPointFeature) => {
              return !isEqual(node.geometry.coordinates, position);
            })
          : nodes;
      })
      .flat()
      .filter((feature) => feature);
    if (!adsorbPoints.length) {
      adsorbPoints = coordAll(featureCollection(features)).map((position) =>
        point(position),
      );
    }

    adsorbLines = features
      .map((feature) => {
        const line: ILineFeature = feature.properties?.line;
        if (feature.properties?.isActive && line) {
          const { nodes } = line.properties;
          const positionsList = splitByPosition(
            nodes.map((node) => node.geometry.coordinates),
            position,
          ).filter((positions: Position[]) => positions.length > 1);

          return positionsList.map((positions) => lineString(positions));
        }
        return [line];
      })
      .flat()
      .filter((feature) => feature);

    if (!adsorbLines.length) {
      features.forEach((feature) => {
        const featureType = getType(feature);
        if (/linestring/i.test(featureType)) {
          adsorbLines.push(feature as Feature<LineString>);
        }
        if (/polygon/i.test(featureType)) {
          const result = polygonToLine(feature as Feature<Polygon>);
          // @ts-ignore
          return adsorbLines.push(...(result?.features ?? [result]));
        }
      });
    }
  }

  return {
    points: adsorbPoints,
    lines: adsorbLines,
  };
};

export const getAdsorbPoint = (
  position: Position,
  points: Feature<Point>[],
  options: IAdsorbOptions,
  scene: Scene,
) => {
  const { pointAdsorbPixel } = options;
  const [lng, lat] = position;
  const { x: mouseX, y: mouseY } = scene.lngLatToPixel([lng, lat]);
  const squareDistanceList = points.map((point) => {
    const [lng, lat] = point.geometry.coordinates;
    const { x, y } = scene.lngLatToPixel([lng, lat]);
    return (mouseX - x) ** 2 + (mouseY - y) ** 2;
  });
  const minIndex = findMinIndex(squareDistanceList);
  const minDistance = squareDistanceList[minIndex] ** 0.5;

  if (minDistance <= pointAdsorbPixel) {
    return points[minIndex].geometry.coordinates;
  } else {
    return null;
  }
};

export const getAdsorbLine = (
  position: Position,
  lines: Feature<LineString>[],
  options: IAdsorbOptions,
  scene: Scene,
) => {
  const { lineAdsorbPixel } = options;
  const [lng, lat] = position;
  const { x: mouseX, y: mouseY } = scene.lngLatToPixel([lng, lat]);
  const nearestPointList = lines
    .filter((line) => coordAll(line).length > 1)
    .map((line) => {
      return nearestPointOnLine(line, position);
    });
  if (!nearestPointList.length) {
    return null;
  }
  const squareDistanceList = nearestPointList.map((point) => {
    const [lng, lat] = point.geometry.coordinates;
    const { x, y } = scene.lngLatToPixel([lng, lat]);
    return (mouseX - x) ** 2 + (mouseY - y) ** 2;
  });

  const minIndex = findMinIndex(squareDistanceList);
  const minDistance = squareDistanceList[minIndex] ** 0.5;

  if (minDistance <= lineAdsorbPixel) {
    return nearestPointList[minIndex].geometry.coordinates;
  } else {
    return null;
  }
};
