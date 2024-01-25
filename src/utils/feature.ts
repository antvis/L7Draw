import {
  bbox,
  coordAll,
  featureCollection,
  lineString,
  point,
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
 * @param data
 * @returns
 */
export const injectFeatureBBox = <T extends IBaseFeature | IBaseFeature[]>(
  data: T,
) => {
  if (Array.isArray(data)) {
    data.forEach((feature) => {
      feature.bbox = bbox(feature);
    });
  } else {
    data.bbox = bbox(data);
  }
  return data;
};
