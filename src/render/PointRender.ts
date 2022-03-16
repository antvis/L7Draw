import { BaseRender } from './BaseRender';
import { IPointFeature, IPointStyle } from '../typings';
import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class PointRender extends BaseRender<IPointFeature, IPointStyle> {
  initLayers(): ILayer[] {
    const { normal, hover, active } = this.style;
    const layer = new PointLayer()
      .source(featureCollection([]))
      .size('isHover*isActive', (isHover: boolean, isActive: boolean) =>
        isActive ? active.size : isHover ? hover.size : normal.size,
      )
      .color('isHover*isActive', (isHover: boolean, isActive: boolean) =>
        isActive ? active.color : isHover ? hover.color : normal.color,
      )
      .shape('isHover*isActive', (isHover: boolean, isActive: boolean) =>
        isActive ? active.shape : isHover ? hover.shape : normal.shape,
      )
      .style({
        stroke: [
          'isHover*isActive',
          (isHover: boolean, isActive: boolean) =>
            isActive
              ? active.borderColor
              : isHover
              ? hover.borderColor
              : normal.borderColor,
        ],
        strokeWidth: [
          'isHover*isActive',
          (isHover: boolean, isActive: boolean) =>
            isActive
              ? active.borderWidth
              : isHover
              ? hover.borderWidth
              : normal.borderWidth,
        ],
      });

    return [layer];
  }
}
