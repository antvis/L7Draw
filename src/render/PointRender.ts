import { BaseRender } from './BaseRender';
import { IPointFeature, IPointStyle } from '../typings';
import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class PointRender extends BaseRender<IPointFeature, IPointStyle> {
  initLayers(): ILayer[] {
    const { normal, active } = this.style;
    const layer = new PointLayer()
      .source(featureCollection([]))
      .size('isActive', (isActive: boolean) =>
        isActive ? active.size : normal.size,
      )
      .color('isActive', (isActive: boolean) =>
        isActive ? active.color : normal.color,
      )
      .shape('isActive', (isActive: boolean) =>
        isActive ? active.shape : normal.shape,
      )
      .style({
        stroke: [
          'isActive',
          (isActive: boolean) =>
            isActive ? active.borderColor : normal.borderColor,
        ],
        strokeWidth: [
          'isActive',
          (isActive: boolean) =>
            isActive ? active.borderWidth : normal.borderWidth,
        ],
      });

    return [layer];
  }
}
