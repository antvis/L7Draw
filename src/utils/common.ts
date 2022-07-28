import { Scene } from '@antv/l7';
import { Position } from '@turf/turf';
import { ILayerMouseEvent, ILngLat, ISceneMouseEvent } from '../typings';

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

export const getPosition: (
  e: ISceneMouseEvent | ILayerMouseEvent,
) => Position = (e) => {
  const { lng, lat } = getLngLat(e);
  return [lng, lat];
};

/**
 * 将lnglat转换为position格式
 * @param lng
 * @param lat
 */
export const transLngLat2Position: (lngLat: ILngLat) => Position = ({
  lng,
  lat,
}) => [lng, lat];

/**
 * 找到最小值的下标
 * @param array
 */
export const findMinIndex = (array: number[]) => {
  let maxValue = Number.MAX_SAFE_INTEGER;
  let maxIndex = 0;
  const length = array.length;
  for (let index = 0; index < length; index++) {
    if (array[index] < maxValue) {
      maxValue = array[index];
      maxIndex = index;
    }
  }
  return maxIndex;
};
