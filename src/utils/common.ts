import { v4 } from 'uuid';
import { IBaseFeature, ISceneMouseEvent } from '../typings';
import { Scene } from '@antv/l7';

// @ts-ignore
const isDev = process.env.NODE_ENV === 'development';

/**
 * 获取feature唯一id
 */
export const getUuid = (() => {
  let count = 1;
  return (prefix = '') => {
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
 * 获取完全覆盖地图区域的DOM，会根据地图类型返回不同的结果
 * @param scene
 */
export const getMapDom = (scene: Scene) => {
  const container = scene.getContainer();
  return (
    container?.querySelector('.l7-marker-container') ||
    container?.querySelector('.amap-maps')
  );
};

/**
 * 磨平L7 Scene 鼠标事件返回的经纬度差异
 * @param e
 */
export const getLngLat = (e: ISceneMouseEvent) => {
  return e.lngLat || e.lnglat;
};
