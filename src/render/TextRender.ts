import { BaseRender } from './BaseRender';
import { ITextFeature, ITextStyle } from '../typings';
import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class TextRender extends BaseRender<ITextFeature, ITextStyle> {
  initLayers(): ILayer[] {
    const { color, size, borderColor, borderWidth } = this.style.normal;
    const layer = new PointLayer()
      .source(featureCollection([]))
      .size(size)
      .color(color)
      .shape('text', 'text')
      .style({
        stroke: borderColor,
        strokeWidth: borderWidth,
      });

    layer.setBlend('normal');

    return [layer];
  }
}
