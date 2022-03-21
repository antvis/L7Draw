import { BaseRender } from './BaseRender';
import { IPointFeature, IPointStyle, IPointStyleItem } from '../typings';
import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class PointRender extends BaseRender<IPointFeature, IPointStyle> {
  initLayer(style: IPointStyleItem): ILayer {
    const { size, color, shape, borderColor, borderWidth } = style;
    const layer = new PointLayer()
      .source(featureCollection([]))
      .size(size)
      .color(color)
      .shape(shape)
      .style({
        stroke: borderColor,
        strokeWidth: borderWidth,
      });

    layer.setBlend('normal');

    return layer;
  }
}
