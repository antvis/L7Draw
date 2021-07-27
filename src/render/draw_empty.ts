import { FeatureCollection } from '@turf/helpers';

import BaseRender from './base_render';
type CallBack = (...args: any[]) => any;

/**
 * An empty renderer that does nothing. Use as placeholder for disabled layers
 */
export default class DrawEmptyLayer extends BaseRender {
  public update(fc: FeatureCollection) {}
  public on(type: any, handler: CallBack) {}
  public off(type: any, handler: CallBack) {}
  public emit(type: string, e: any) {}
  public updateData(data: any) {}
  public destroy() {}
  public removeLayers() {}
  public addLayers() {}
  public show() {}
  public hide() {}
}
