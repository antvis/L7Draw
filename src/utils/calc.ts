import {
  along,
  area,
  center,
  centerOfMass,
  coordAll,
  distance,
  Feature,
  featureCollection,
  length,
  LineString,
  point,
  Polygon,
} from '@turf/turf';
import {
  IAreaOptions,
  IDashLineFeature,
  IDistanceOptions,
  ILineFeature,
  ITextFeature,
  ITextProperties,
} from '../typings';
import { getUuid } from './feature';

/**
 * 将数字转四舍五入为目标精度位数的数字
 * @param num
 * @param precision
 * @returns
 */
export const getPrecisionNumber = (num: number, precision = 6) => {
  return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
};

/**
 * 获取线段的中心点Feature
 * @param feature
 */
export const getLineCenterPoint = (feature: Feature<LineString>) => {
  const dis = length(feature, {
    units: 'meters',
  });
  return along(feature, dis / 2, {
    units: 'meters',
  });
};

/**
 * 返回线段对应的距离文本
 * @param feature
 * @param showTotalDistance
 * @param format
 * @param properties
 */
export const calcDistanceTextsByLine = (
  feature: ILineFeature | IDashLineFeature,
  {
    showTotalDistance,
    format,
  }: Pick<IDistanceOptions, 'showTotalDistance' | 'format'>,
  properties: Partial<ITextProperties> = {},
) => {
  const textList: ITextFeature[] = [];
  if (showTotalDistance) {
    const text = getLineCenterPoint(feature) as ITextFeature;
    const meters = length(feature, {
      units: 'meters',
    });
    const pointFeatures = coordAll(feature).map((item) => point(item));
    text.properties = {
      id: getUuid('text'),
      isActive: false,
      meters,
      text: format(meters, pointFeatures),
      type: 'totalDistance',
      ...properties,
    };
    textList.push(text);
  } else {
    const { coordinates } = feature.geometry;
    for (let index = 0; index < coordinates.length - 1; index++) {
      const currentPoint = point(coordinates[index]);
      const nextPoint = point(coordinates[index + 1]);
      const meters = distance(currentPoint, nextPoint, {
        units: 'meters',
      });

      const text = center(
        featureCollection([currentPoint, nextPoint]),
      ) as ITextFeature;
      text.properties = {
        id: getUuid('text'),
        isActive: false,
        meters,
        text: format(meters, [currentPoint, nextPoint]),
        type: 'distance',
        ...properties,
      };
      textList.push(text);
    }
  }
  return textList;
};

/**
 * 根据传入的polygon和options配置获取面积文本Feature
 * @param feature
 * @param options
 * @param properties
 */
export const calcAreaText = (
  feature: Feature<Polygon>,
  options: Pick<IAreaOptions, 'format'>,
  properties: Partial<ITextProperties> = {},
) => {
  const { format } = options;
  const meters = area(feature);
  return centerOfMass(feature, {
    properties: {
      meters,
      text: format(meters, feature),
      type: 'area',
      isActive: false,
      ...properties,
    },
  }) as ITextFeature;
};
