import { LayerRender } from './layer-render';
import { ITextFeature, ITextStyle } from '../typings';
import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class TextRender extends LayerRender<ITextFeature, ITextStyle> {
  getLayers(): ILayer[] {
    const { normal, active, style } = this.style;
    const layer = new PointLayer({
      blend: 'normal',
    })
      .source(featureCollection([]))
      .size('isActive', (isActive: boolean) => {
        return isActive ? active.size : normal.size;
      })
      .color('isActive', (isActive: boolean) => {
        return isActive ? active.color : normal.color;
      })
      .shape('text', 'text')
      .style({
        stroke: [
          'isActive',
          (isActive: boolean) => {
            return isActive ? active.borderColor : normal.borderColor;
          },
        ],
        strokeWidth: [
          'isActive',
          (isActive: boolean) => {
            return isActive ? active.borderWidth : normal.borderWidth;
          },
        ],
        ...style,
      });

    return [layer];
  }
}
