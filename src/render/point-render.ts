import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { debounce } from 'lodash-es';
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
              ? active.stroke
              : isHover
              ? hover.stroke
              : normal.stroke;
          },
        ],
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
    this.emit(RenderEvent.UnClick, e);
  };

  onMouseMove = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.Mousemove, e);
  };

  onMouseOut = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.Mouseout, e);
  };

  onMouseDown = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.Dragstart, e);
  };

  onDragging = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.Dragging, e);
  };

  onDragEnd = debounce((e: ISceneMouseEvent) => {
    this.emit(RenderEvent.Dragend, e);
  }, 0);

  onClick = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.Click, e);
  };

  onContextmenu = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.Contextmenu, e);
  };

  enableCreate() {
    this.disableCreate();
    this.layers[0].on(LayerEvent.UnClick, this.onCreate);
  }

  disableCreate() {
    this.layers[0].off(LayerEvent.UnClick, this.onCreate);
  }

  enableHover() {
    this.disableHover();
    this.layers[0]?.on(LayerEvent.Mousemove, this.onMouseMove);
    this.layers[0]?.on(LayerEvent.Mouseout, this.onMouseOut);
  }

  disableHover() {
    this.layers[0]?.off(LayerEvent.Mousemove, this.onMouseMove);
    this.layers[0]?.off(LayerEvent.Mouseout, this.onMouseOut);
  }

  enableDrag() {
    this.disableDrag();
    this.layers[0].on(LayerEvent.Mousedown, this.onMouseDown);
    this.scene.on(SceneEvent.Dragging, this.onDragging);
    this.scene.on(SceneEvent.Mouseup, this.onDragEnd);
    this.scene.on(SceneEvent.Dragend, this.onDragEnd);
  }

  disableDrag() {
    this.layers[0].off(LayerEvent.Mousedown, this.onMouseDown);
    this.scene.off(SceneEvent.Dragging, this.onDragging);
    this.scene.off(SceneEvent.Mouseup, this.onDragEnd);
    this.scene.off(SceneEvent.Dragend, this.onDragEnd);
  }

  enableClick() {
    this.disableClick();
    this.layers[0].on(LayerEvent.Click, this.onClick);
  }

  disableClick() {
    this.layers[0].off(LayerEvent.Click, this.onClick);
  }

  enableContextMenu() {
    this.disableContextMenu();
    this.layers[0].on(LayerEvent.Contextmenu, this.onContextmenu);
  }

  disableContextMenu() {
    this.layers[0].off(LayerEvent.Contextmenu, this.onContextmenu);
  }
}
