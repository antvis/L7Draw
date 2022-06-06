import { IBaseFeature } from './feature';

/**
 * 经纬度信息
 */
export interface ILngLat {
  lng: number;
  lat: number;
}

/**
 * Scene回调事件类型
 */
export interface ISceneMouseEvent {
  type: string;
  lnglat: ILngLat;
  lngLat: ILngLat;
  pixel: {
    x: number;
    y: number;
  };
}

/**
 * 图层回调事件类型
 */
export interface ILayerMouseEvent<T extends IBaseFeature = IBaseFeature> {
  type: string;
  feature?: T;
  featureId?: number;
  lngLat: ILngLat;
  x: number;
  y: number;
}
