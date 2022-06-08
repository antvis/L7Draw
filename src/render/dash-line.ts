import { BaseRender } from './base-render';
import {
  IDashLineFeature,
  IDashLineStyle,
} from '../typings';
import { ILayer, LineLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class DashLineRender extends BaseRender<
  IDashLineFeature,
  IDashLineStyle
> {
  getLayers(): ILayer[] {
    const { normal, style } = this.style;

    const layer = new LineLayer({
      blend: 'normal',
    })
      .source(featureCollection([]))
      .size(normal.size)
      .color(normal.color)
      .shape('line')
      .style(style);

    return [layer];
  }
}
