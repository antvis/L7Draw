import { v4 } from 'uuid';
import { Scene } from '@antv/l7';
import { IBaseFeature, ILayerMouseEvent, ISceneMouseEvent } from '../typings';

// @ts-ignore
export const isDev = process.env.NODE_ENV === 'development';

/**
 * 获取完全覆盖地图区域的DOM，会根据地图类型返回不同的结果
 * @param scene
 */
export const getMapDom = (scene: Scene): HTMLDivElement | null => {
  const container = scene.getContainer();
  return (
    container?.querySelector('.l7-marker-container') ??
    container?.querySelector('.amap-maps') ??
    null
  );
};

/**
 * 磨平L7 Scene 鼠标事件返回的经纬度差异
 * @param e
 */
export const getLngLat = (e: ISceneMouseEvent | ILayerMouseEvent) => {
  // @ts-ignore
  return e.lngLat || e.lnglat;
};
