import { PointLayer } from '@antv/l7';
import { FeatureCollection } from '@turf/helpers';
import { IRenderStrategy } from '.';
import { Singleton } from '../../util/singleton';

export default class RenderTextStrategy extends Singleton
  implements IRenderStrategy {
  styleVariant = 'point';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    // only render if feature properties contains value attribute
    if (!fe.features[0]?.properties?.value) return [];

    const layer = new PointLayer({
      zIndex: 2,
      pickingBuffer: 3,
    })
      .source(fe)
      .style(style.style)
      .shape('value', 'text')
      .size(14)
      .color(style.color);

    layer.zIndex = style.zIndex;

    return [layer];
  }
}
