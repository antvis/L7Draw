import { v4 } from 'uuid';
import { isDev } from './common';
import {
  IBaseFeature,
  IPointFeature,
  IPointProperties,
  IRenderType,
} from '../typings';
import { Position } from '@turf/turf';
import { point } from '_@turf_turf@6.5.0@@turf/turf';

/**
 * 获取feature唯一id
 */
export const getUuid = (() => {
  let count = 1;
  return (prefix: IRenderType) => {
    return `${prefix}-${isDev ? count++ : v4()}`;
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
    id: getUuid('point'),
    isHover: false,
    isActive: false,
    isDrag: false,
    createTime: Date.now(),
    ...properties,
  }) as IPointFeature;
};
