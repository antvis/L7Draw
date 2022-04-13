import { BaseRender } from './BaseRender';
import {
  ILayerMouseEvent,
  IPointFeature,
  IPointStyle,
  ISceneMouseEvent,
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
    const feature = point([lng, lat], {
      id: getUuid('point'),
      isHover: false,
      isActive: false,
      isDrag: false,
    }) as IPointFeature;
    this.emit(RenderEvent.unclick, {
      ...e,
      feature,
    });
  };

  onMouseMove = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.mousemove, e);
  };

  onMouseOut = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.mouseout, e);
  };

  onMouseDown = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.mousedown, e);
  };

  onDragging = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.dragging, e);
  };

  onDragEnd = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.dragend, e);
  };

  enableCreate() {
    this.layers[0].on('unclick', this.onCreate);
  }

  disableCreate() {
    this.layers[0].off('unclick', this.onCreate);
  }

  enableHover() {
    this.layers[0].on('mousemove', this.onMouseMove);
    this.layers[0].on('mouseout', this.onMouseOut);
  }

  disableHover() {
    this.layers[0].off('mousemove', this.onMouseMove);
    this.layers[0].off('mouseout', this.onMouseOut);
  }

  enableEdit() {
    this.layers[0].on('mousedown', this.onMouseDown);
    this.scene.on('dragging', this.onDragging);
    this.scene.on('dragend', this.onDragEnd);
  }

  disableEdit() {
    this.layers[0].off('mousedown', this.onMouseDown);
    this.scene.off('dragging', this.onDragging);
    this.scene.off('dragend', this.onDragEnd);
  }
}
