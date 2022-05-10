import {
  IAreaOptions,
  IDistanceOptions,
  ILineFeature,
  IMidPointFeature,
  ITextFeature,
} from '../typings';
import {
  along,
  area,
  center,
  centerOfMass,
  distance,
  Feature,
  featureCollection,
  length,
  LineString,
  point,
  Polygon,
} from '@turf/turf';
import { getUuid } from './common';

/**
 * 计算LineString各个结点之间的中心点列表
 * @param feature
 */
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
 * 根据传入的lineString和options配置获取长度文本Feature
 * @param feature
 * @param options
 */
export const calcDistanceText = (
  feature: Feature<LineString>,
  options: IDistanceOptions,
) => {
  const { format, total } = options;
  const textList: ITextFeature[] = [];
  // total为true时计算整个LineString的长度
  if (total) {
    const text = getLineCenterPoint(feature) as ITextFeature;
    text.properties = {
      ...text.properties,
      text: format(
        length(feature, {
          units: 'meters',
        }),
      ),
    };
    textList.push(text);
    // total为false时，计算LineString中每两个结点之间的数据
  } else if (feature.geometry) {
    const { coordinates } = feature.geometry;
    for (let index = 0; index < coordinates.length - 1; index++) {
      const currentPoint = point(coordinates[index]);
      const nextPoint = point(coordinates[index + 1]);
      const meters = distance(currentPoint, nextPoint, {
        units: 'meters',
      });

      const text = center(featureCollection([currentPoint, nextPoint]), {
        properties: {
          text: format(meters),
        },
      }) as ITextFeature;
      textList.push(text);
    }
  }
  return textList;
};

/**
 * 根据传入的polygon和options配置获取面积文本Feature
 * @param feature
 * @param options
 */
export const calcAreaText = (
  feature: Feature<Polygon>,
  options: IAreaOptions,
) => {
  const { format } = options;
  return centerOfMass(feature, {
    properties: {
      // @ts-ignore
      text: format(area(feature)),
    },
  }) as ITextFeature;
};
