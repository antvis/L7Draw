import { ILayer, LineLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { IDashLineFeature, IDashLineStyle } from '../typings';
import { LayerRender } from './layer-render';

export class DashLineRender extends LayerRender<
  IDashLineFeature,
  IDashLineStyle
> {
  initLayers(): ILayer[] {
    const { normal, style, options } = this.style;

    const layer = new LineLayer(options ?? {})
      .source(featureCollection([]))
      .size(normal.size)
      .color(normal.color)
      .shape('line')
      .style(style);

    return [layer];
  }
}
