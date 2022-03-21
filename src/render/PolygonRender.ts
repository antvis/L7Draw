import { BaseRender } from './BaseRender';
import { IPolygonFeature, IPolygonStyle, IPolygonStyleItem } from '../typings';
import { ILayer, PolygonLayer } from '@antv/l7';

export class PolygonRender extends BaseRender<IPolygonFeature, IPolygonStyle> {
  initLayer(style: IPolygonStyleItem): ILayer {
    const polygonLayer = new PolygonLayer();
    return polygonLayer;
  }
}
