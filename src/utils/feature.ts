import {
  bbox,
  coordAll,
  Feature,
  featureCollection,
  LineString,
  lineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  point,
  Polygon,
  Position,
} from '@turf/turf';
import { first } from 'lodash';
import {
  IBaseFeature,
  ILineFeature,
  ILineProperties,
  IPointFeature,
  IPointProperties,
  IPolygonFeature,
  IPolygonProperties,
  IRenderType,
} from '../typings';

/**
 * 获取feature唯一id
 */
export const getUuid = (() => {
  let count = 1;
  return (prefix: IRenderType) => {
    return `${prefix}-${count++}`;
  };
})();

/**
 * 根据id判断两个feature是否为同一feature
 * @param feature1
 * @param feature2
 */
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

/**
 * 对target数据使用targetHandler，对target以外数据采用otherHandler
 * @param target
 * @param data
 * @param targetHandler
 * @param otherHandler
 */
export const updateTargetFeature = <F extends IBaseFeature>({
  target,
  data,
  targetHandler,
  otherHandler,
}: {
  target: F;
  data: F[];
  targetHandler?: (item: F, index: number) => F | void;
  otherHandler?: (item: F, index: number) => F | void;
}) => {
  return data.map((item, index) => {
    const handler = isSameFeature(item, target) ? targetHandler : otherHandler;
    return handler?.(item, index) ?? item;
  });
};

export const getDefaultPointProperties = () => {
  return {
    id: getUuid('point'),
    isHover: false,
    isActive: false,
    isDrag: false,
    createTime: Date.now(),
  };
};

export const getDefaultLineProperties = () => {
  return {
    id: getUuid('line'),
    isHover: false,
    isActive: false,
    isDrag: false,
    isDraw: false,
    createTime: Date.now(),
  };
};

export const getDefaultPolygonProperties = () => {
  return {
    id: getUuid('polygon'),
    isHover: false,
    isActive: false,
    isDrag: false,
    isDraw: false,
    createTime: Date.now(),
  };
};

// export const getDefaultLinePro

/**
 * 创建
 * @param position
 * @param properties
 */
export const createPointFeature = (
  position: Position,
  properties: Partial<IPointProperties> = {},
) => {
  return point(position, {
    ...getDefaultPointProperties(),
    ...properties,
  }) as IPointFeature;
};

export const createLineFeature = (
  nodes: IPointFeature[],
  properties: Partial<ILineProperties> = {},
) => {
  return {
    type: 'Feature',
    properties: {
      ...getDefaultLineProperties(),
      nodes,
      ...properties,
    },
    geometry: {
      type: 'LineString',
      coordinates: coordAll(featureCollection(nodes)),
    },
  } as ILineFeature;
};

export const createDashLine = (positions: Position[]) => {
  return lineString(positions, {
    id: getUuid('dashLine'),
  });
};

export const createPolygonFeature = (
  nodes: IPointFeature[],
  properties: Partial<IPolygonProperties> = {},
) => {
  return {
    type: 'Feature',
    properties: {
      ...getDefaultPolygonProperties(),
      nodes,
      ...properties,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coordAll(featureCollection([...nodes, first(nodes)!]))],
    },
  } as IPolygonFeature;
};

/**
 * 为 feature 加入 bbox 属性
 * @param features
 * @returns
 */
export const injectFeaturesBBox = <
  T extends
    | Feature
    | IBaseFeature
    | IPointFeature
    | ILineFeature
    | IPolygonFeature,
>(
  features: T[],
) => {
  features.forEach((feature) => {
    feature.bbox = bbox(feature);
  });
  return features;
};

/**
 * 在 setData 时调用，将数据中的 Multi 元素拆分成多个单元素，并赋予 multiIndex，以便在 getData 时组装
 * @param features
 * @returns
 */
export const splitMultiFeatures = <
  T extends Feature<
    Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon
  >,
>(
  features: T[],
) => {
  return features
    .map((feature, index) => {
      if (feature.geometry.type.startsWith('Multi')) {
        const newType = feature.geometry.type.replace('Multi', '') as any;

        return feature.geometry.coordinates.map((coordinates) => {
          return {
            type: 'Feature',
            properties: { ...feature.properties, multiIndex: index },
            geometry: {
              type: newType,
              coordinates,
            },
          };
        });
      }
      return feature;
    })
    .flat() as T[];
};

/**
 * 在 getData 时调用，将分散的 Multi 数据组装成原始 Multi 结构的 feature
 * @param features
 * @returns
 */
export const joinMultiFeatures = <
  T extends Feature<
    Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon
  >,
>(
  features: T[],
) => {
  const newFeatures: T[] = [];
  const multiFeatureMap: Record<string, T> = {};
  features.forEach((feature) => {
    const multiIndex = feature.properties?.multiIndex;
    if (typeof multiIndex === 'number') {
      const targetMultiFeature = multiFeatureMap[multiIndex];
      if (targetMultiFeature) {
        targetMultiFeature.geometry.coordinates.push(
          feature.geometry.coordinates as any,
        );
      } else {
        const newType = `Multi${feature.geometry.type}` as any;
        const newMultiFeature = {
          type: 'Feature',
          properties: { ...feature.properties },
          geometry: {
            type: newType,
            coordinates: [feature.geometry.coordinates],
          },
        } as T;
        multiFeatureMap[multiIndex] = newMultiFeature;
        newFeatures.push(newMultiFeature);
      }
    } else {
      newFeatures.push(feature);
    }
  });
  return newFeatures;
};
