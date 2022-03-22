import { BaseRender } from './BaseRender';
import { IPolygonFeature, IPolygonStyle, IPolygonStyleItem } from '../typings';
import { ILayer, PolygonLayer } from '@antv/l7';

export class PolygonRender extends BaseRender<IPolygonFeature, IPolygonStyle> {
  initLayers(): ILayer[] {
    return [];
  }
}
