import { BaseRender } from './BaseRender';
import { ILineFeature, ILineStyle } from '../typings';
import { ILayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class LineRender extends BaseRender<ILineFeature, ILineStyle> {
  initLayers(): ILayer[] {
    const { normal, hover, active } = this.style;

    return [];
  }
}
