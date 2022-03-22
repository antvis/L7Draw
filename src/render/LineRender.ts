import { BaseRender } from './BaseRender';
import { ILineFeature, ILineStyle, ILineStyleItem } from '../typings';
import { ILayer, LineLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class LineRender extends BaseRender<ILineFeature, ILineStyle> {
  initLayers(): ILayer[] {
    // const { size, color, shape } = style;
    // const layer = new LineLayer()
    //   .source(featureCollection([]))
    //   .size(size)
    //   .color(color)
    //   .shape(shape);
    //
    // layer.setBlend('normal');
    //
    // return [layer];
    return [];
  }
}
