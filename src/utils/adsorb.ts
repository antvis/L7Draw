import {
  AdsorbTargetFeature,
  IAdsorbOptions,
  ILineFeature,
  IPointFeature,
} from '../typings';
import { BaseMode, LineMode, PolygonMode } from '../mode';
import {
  BBox,
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
import { injectFeaturesBBox } from './feature';
import { isEqual } from 'lodash';

const getAdsorbPoint = (
  position: Position,
  features: Feature[],
  options: IAdsorbOptions,
  scene: Scene,
) => {
  const { pointAdsorbPixel } = options;
  let points: Feature<Point>[] = [];
  // 获取 features 中所有的点
  if (features.length)
    points = features
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
  if (!points.length) {
    points = coordAll(featureCollection(features)).map((position) =>
      point(position),
    );
  }

  // 通过计算当前鼠标向外扩展 pixel 的 bbox 快速筛选 points
  points = points.filter((point) => {
    const pointExpandBBox = getPixelExpandBBox(point, scene, pointAdsorbPixel);
    return isPositionInBBox(position, pointExpandBBox);
  });

  if (!points.length) {
    return null;
  }

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

const getAdsorbLine = (
  position: Position,
  features: Feature[],
  options: IAdsorbOptions,
  scene: Scene,
) => {
  let lines: Feature<LineString>[] = [];

  lines = features
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

  if (!lines.length) {
    features.forEach((feature) => {
      const featureType = getType(feature);
      if (/linestring/i.test(featureType)) {
        lines.push(feature as Feature<LineString>);
      }
      if (/polygon/i.test(featureType)) {
        const result = polygonToLine(feature as Feature<Polygon>);
        // @ts-ignore
        return lines.push(...(result?.features ?? [result]));
      }
    });
  }

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

/**
 * 返回 feature 的 bbox 向外扩展 expandPixel 像素后的新 bbox
 * @param feature
 * @param scene
 * @param expandPixel
 * @returns
 */
export const getPixelExpandBBox = (
  feature: any,
  scene: Scene,
  expandPixel: number,
) => {
  const bbox: BBox = feature.bbox ?? injectFeaturesBBox([feature])[0].bbox;
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const { x: minX, y: minY } = scene.lngLatToContainer([minLng, minLat]);
  const { x: maxX, y: maxY } = scene.lngLatToContainer([maxLng, maxLat]);
  const { lng: lng1, lat: lat1 } = scene.containerToLngLat([
    minX - expandPixel,
    minY + expandPixel,
  ]);
  const { lng: lng2, lat: lat2 } = scene.containerToLngLat([
    maxX + expandPixel,
    maxY - expandPixel,
  ]);
  return [
    Math.min(lng1, lng2),
    Math.min(lat1, lat2),
    Math.max(lng1, lng2),
    Math.max(lat1, lat2),
  ] as BBox;
};

/**
 * 判断 position 是否在 bbox 内
 * @param position
 * @param bbox
 * @returns
 */
export const isPositionInBBox = (position: Position, bbox: BBox) => {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const [lng, lat] = position;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
};

/**
 * 获取当前数据对应的吸附点、线数组
 * @param adsorbDataConfig
 * @param draw
 * @param position
 */
export const getAdsorbPosition: ({
  adsorbOptions,
  draw,
  position,
  scene,
}: {
  adsorbOptions: IAdsorbOptions;
  draw: LineMode<any> | PolygonMode<any>;
  position: Position;
  scene: Scene;
}) => Position = ({ adsorbOptions, draw, position, scene }) => {
  const { data: adsorbData, pointAdsorbPixel, lineAdsorbPixel } = adsorbOptions;
  let features: AdsorbTargetFeature[] = [];
  if (adsorbData === 'allDrawData') {
    features = BaseMode.instances.map((draw) => draw.getData(true)).flat();
  } else if (adsorbData === 'drawData') {
    features = draw.getData(true);
  } else if (adsorbData instanceof Function) {
    features = adsorbData(position);
  } else {
    features = adsorbData;
  }

  // 通过 bbox 筛选出在吸附范围的 features
  features = features.filter((feature) => {
    if (feature.properties?.isActive) {
      return true;
    }
    const pointExpandBBox = getPixelExpandBBox(
      feature,
      scene,
      pointAdsorbPixel,
    );
    if (isPositionInBBox(position, pointExpandBBox)) {
      return true;
    }
    const lineExpandBBox = getPixelExpandBBox(feature, scene, lineAdsorbPixel);
    if (isPositionInBBox(position, lineExpandBBox)) {
      return true;
    }
    return false;
  });

  if (adsorbOptions.pointAdsorbPixel > 0) {
    // 获取 features 中距离最近的点
    const adsorbPointPosition = getAdsorbPoint(
      position,
      features,
      adsorbOptions,
      scene,
    );

    if (adsorbPointPosition) {
      return adsorbPointPosition;
    }
  }

  if (adsorbOptions.lineAdsorbPixel > 0) {
    const adsorbLinePosition = getAdsorbLine(
      position,
      features,
      adsorbOptions,
      scene,
    );

    if (adsorbLinePosition) {
      return adsorbLinePosition;
    }
  }

  return position;
};
