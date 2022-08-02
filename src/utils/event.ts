import { ILayerMouseEvent, ISceneMouseEvent } from '../typings';
import { Position } from '@turf/turf';

export const resetEventLngLat = (
  e: ILayerMouseEvent | ISceneMouseEvent,
  position: Position,
) => {
  const [lng, lat] = position;
  if (e.lngLat) {
    e.lngLat = {
      lng,
      lat,
    };
  }
  // @ts-ignore
  if (e.lnglat) {
    // @ts-ignore
    e.lnglat = {
      lng,
      lat,
    };
  }
};
