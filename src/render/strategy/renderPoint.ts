import { PointLayer } from '@antv/l7';
import { FeatureCollection } from '@turf/helpers';
import { IRenderStrategy } from '.';
import { Singleton } from '../../util/singleton';

export default class RenderPointStrategy extends Singleton
  implements IRenderStrategy {
  styleVariant = 'point';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    // 有值时用文字渲染
    if (fe.features[0]?.properties?.value) return [];

    const layer = new PointLayer({
      zIndex: 2,
      pickingBuffer: 3,
    })
      .source(fe)
      .shape('circle')
      .color(style.color)
      .size(style.size)
      .style(style.style);
    return [layer];
  }
}
