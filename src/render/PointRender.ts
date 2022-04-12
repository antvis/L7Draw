import { BaseRender } from './BaseRender';
import {
  ILayerMouseEvent,
  ILngLat,
  IPointFeature,
  IPointStyle,
} from '../typings';
import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection, point } from '@turf/turf';
import { RenderEvent } from '../constants';
import { getUuid } from '../utils';

export class PointRender extends BaseRender<IPointFeature, IPointStyle> {
  initLayers(): ILayer[] {
    const { normal, hover, active } = this.style;
    const layer = new PointLayer()
      .source(featureCollection([]))
      .size('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.size : isHover ? hover.size : normal.size;
      })
      .color('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.color : isHover ? hover.color : normal.color;
      })
      .shape('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.shape : isHover ? hover.shape : normal.shape;
      })
      .style({
        stroke: [
          'isHover*isActive',
          (isHover: boolean, isActive: boolean) => {
            return isActive
              ? active.borderColor
              : isHover
              ? hover.borderColor
              : normal.borderColor;
          },
        ],
        strokeWidth: [
          'isHover*isActive',
          (isHover: boolean, isActive: boolean) => {
            return isActive
              ? active.borderWidth
              : isHover
              ? hover.borderWidth
              : normal.borderWidth;
          },
        ],
      });

    layer.setBlend('normal');

    return [layer];
  }

  onCreate = (e: ILayerMouseEvent) => {
    const { lng, lat } = e.lngLat;
    const pointFeature = point([lng, lat], {
      id: getUuid('point'),
      isHover: false,
      isActive: false,
      isDrag: false,
    }) as IPointFeature;
    this.emit(RenderEvent.add, pointFeature);
  };

  onHover = (e: ILayerMouseEvent) => {};

  enableCreate() {
    this.layers[0].on('unclick', this.onCreate);
  }

  disableCreate() {
    this.layers[0].off('unclick', this.onCreate);
  }

  enableHover() {
    this.layers[0].on('mousemove', this.onHover);
  }

  disableHover() {
    this.layers[0].off('mousemove', this.onHover);
  }
}
