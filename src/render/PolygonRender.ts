import { BaseRender } from './BaseRender';
import { IPolygonFeature, IPolygonStyle } from '../typings';
import { ILayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class PolygonRender extends BaseRender<IPolygonFeature, IPolygonStyle> {
  initLayers(): ILayer[] {
    return [];
  }
}
