import { BaseRender } from './BaseRender';
import { ILineFeature, ILineStyle } from '../typings';
import { ILayer, LineLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class LineRender extends BaseRender<ILineFeature, ILineStyle> {
  initLayers(): ILayer[] {
    const { normal, hover, active, dash } = this.style;
    const layer = new LineLayer()
      .source(featureCollection([]))
      .size('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.size : isHover ? hover.size : normal.size;
      })
      .color('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.color : isHover ? hover.color : normal.color;
      })
      .shape('line')
      .style({
        lineType: dash ? 'dash' : 'solid',
      });

    layer.setBlend('normal');

    return [layer];
  }
}
