import { BaseRender } from './base-render';
import { ILayer, PointLayer } from '@antv/l7';
import {
  ILayerMouseEvent,
  IMidPointFeature,
  IPointFeature,
  IPointStyle,
  ISceneMouseEvent,
} from '../typings';
import { featureCollection } from '@turf/turf';
import { RenderEvent } from '../constant';

export class PointRender extends BaseRender<
  IPointFeature | IMidPointFeature,
  IPointStyle
> {
  getLayers(): ILayer[] {
    const { normal, hover, active, style } = this.style;
    const layer = new PointLayer({
      blend: 'normal',
    })
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
        strokeWidth: 2,
        // strokeWidth: [
        //   'isHover*isActive',
        //   (isHover: boolean, isActive: boolean) => {
        //     return isActive
        //       ? active.borderWidth
        //       : isHover
        //       ? hover.borderWidth
        //       : normal.borderWidth;
        //   },
        // ],
        ...style,
      });

    return [layer];
  }

  onCreate = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.unclick, e);
  };

  onMouseMove = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.mousemove, e);
  };

  onMouseOut = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.mouseout, e);
  };

  onMouseDown = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.dragstart, e);
  };

  onDragging = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.dragging, e);
  };

  onDragEnd = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.dragend, e);
  };

  onClick = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.click, e);
  };

  enableCreate() {
    this.disableCreate();
    this.layers[0].on('unclick', this.onCreate);
  }

  disableCreate() {
    this.layers[0].off('unclick', this.onCreate);
  }

  enableHover() {
    this.disableHover();
    this.layers[0].on('mousemove', this.onMouseMove);
    this.layers[0].on('mouseout', this.onMouseOut);
  }

  disableHover() {
    this.layers[0].off('mousemove', this.onMouseMove);
    this.layers[0].off('mouseout', this.onMouseOut);
  }

  enableDrag() {
    this.disableDrag();
    this.layers[0].on('mousedown', this.onMouseDown);
    this.scene.on('dragging', this.onDragging);
    this.scene.on('mouseup', this.onDragEnd);
  }

  disableDrag() {
    this.layers[0].off('mousedown', this.onMouseDown);
    this.scene.off('dragging', this.onDragging);
    this.scene.off('mouseup', this.onDragEnd);
  }

  enableClick() {
    this.disableClick();
    this.layers[0].on('click', this.onClick);
  }

  disableClick() {
    this.layers[0].off('click', this.onClick);
  }
}
