import { BaseRender } from './BaseRender';
import { IPointFeature, IPointStyle } from '../typings';
import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class PointRender extends BaseRender<IPointFeature, IPointStyle> {
  initLayers(): ILayer[] {
    // const { color, size, innerSize, innerColor } = this.style;
    const layer = new PointLayer().source(featureCollection([]));

    return [];
  }
}
