import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { LayerEvent, RenderEvent, SceneEvent } from '../constant';
import {
  ILayerMouseEvent,
  IPointFeature,
  IPointStyle,
  ISceneMouseEvent,
} from '../typings';
import { LayerRender } from './layer-render';

export class PointRender extends LayerRender<IPointFeature, IPointStyle> {
  getLayers(): ILayer[] {
    const { normal, hover, active, style, options } = this.style;
    const layer = new PointLayer(options ?? {})
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
    this.layers[0].on(LayerEvent.unclick, this.onCreate);
  }

  disableCreate() {
    this.layers[0].off(LayerEvent.unclick, this.onCreate);
  }

  enableHover() {
    this.disableHover();
    this.layers[0]?.on(LayerEvent.mousemove, this.onMouseMove);
    this.layers[0]?.on(LayerEvent.mouseout, this.onMouseOut);
  }

  disableHover() {
    this.layers[0]?.off(LayerEvent.mousemove, this.onMouseMove);
    this.layers[0]?.off(LayerEvent.mouseout, this.onMouseOut);
  }

  enableDrag() {
    this.disableDrag();
    this.layers[0].on(LayerEvent.mousedown, this.onMouseDown);
    this.scene.on(SceneEvent.dragging, this.onDragging);
    this.scene.on(SceneEvent.mouseup, this.onDragEnd);
  }

  disableDrag() {
    this.layers[0].off(LayerEvent.mousedown, this.onMouseDown);
    this.scene.off(SceneEvent.dragging, this.onDragging);
    this.scene.off(SceneEvent.mouseup, this.onDragEnd);
  }

  enableClick() {
    this.disableClick();
    this.layers[0].on(LayerEvent.click, this.onClick);
  }

  disableClick() {
    this.layers[0].off(LayerEvent.click, this.onClick);
  }
}
