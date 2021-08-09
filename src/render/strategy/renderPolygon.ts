import { PolygonLayer } from '@antv/l7';
import { FeatureCollection } from '@turf/helpers';
import { IRenderStrategy } from '.';
import { Singleton } from '@/util/singleton';

export default class RenderPolygonStrategy extends Singleton
  implements IRenderStrategy {
  styleVariant = 'polygon';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    const fill = new PolygonLayer()
      .source(fe)
      .shape('fill')
      .color(style.color)
      .size(style.size)
      .style({
        opacity: style.style.opacity,
      });

    if (style.active) fill.active(style.active);

    const line = new PolygonLayer()
      .source(fe)
      .shape('line')
      .color(style.style.stroke)
      .size(style.style.strokeWidth)
      .style({
        opacity: style.style.strokeOpacity,
        lineType: style.style.lineType,
        dashArray: style.style.dashArray,
      });

    if (style.active) line.active(style.active);

    return [fill, line];
  }
}
