import { IBaseFeature } from './feature';

export interface ILngLat {
  lng: number;
  lat: number;
}

export interface ISceneMouseEvent {
  type: string;
  lnglat: ILngLat;
  lngLat: ILngLat;
  pixel: {
    x: number;
    y: number;
  };
}

export interface ILayerMouseEvent<T = IBaseFeature> {
  type: string;
  feature?: T;
  featureId?: number;
  lngLat: ILngLat;
  x: number;
  y: number;
}