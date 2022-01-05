import { LineLayer } from '@antv/l7';
import { FeatureCollection } from '@turf/helpers';
import { IRenderStrategy } from '.';
import { Singleton } from '../../util/singleton';

export default class RenderLineStrategy extends Singleton
  implements IRenderStrategy {
  styleVariant = 'line';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    const layer = new LineLayer({
      pickingBuffer: 3,
    })
      .source(fe)
      .shape('line')
      .color(style.color)
      .size(style.size)
      .style(style.style);

    layer.zIndex = style.zIndex;

    return [layer];
  }
}
