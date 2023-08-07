import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { ITextFeature, ITextStyle } from '../typings';
import { LayerRender } from './layer-render';

export class TextRender extends LayerRender<ITextFeature, ITextStyle> {
  initLayers(): ILayer[] {
    const { normal, active, style, options } = this.style;
    const layer = new PointLayer(options ?? {})
      .source(featureCollection([]))
      .size('isActive', (isActive: boolean) => {
        return isActive ? active.size : normal.size;
      })
      .color('isActive', (isActive: boolean) => {
        return isActive ? active.color : normal.color;
      })
      .shape('text', 'text')
      .style(style);

    return [layer];
  }
}
