import { ILayer, LineLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { debounce } from 'lodash';
import { LayerEvent, RenderEvent, SceneEvent } from '../constant';
import {
  ILayerMouseEvent,
  ILineFeature,
  ILineStyle,
  ISceneMouseEvent,
} from '../typings';
import { LayerRender } from './layer-render';

export class LineRender extends LayerRender<ILineFeature, ILineStyle> {
  getLayers(): ILayer[] {
    const { normal, hover, active, style, options } = this.style;

    const layer = new LineLayer(options ?? {})
      .source(featureCollection([]))
      .size('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.size : isHover ? hover.size : normal.size;
      })
      .color('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.color : isHover ? hover.color : normal.color;
      })
      .shape('line')
      .style(style);

    return [layer];
  }

  onMouseMove = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.Mousemove, e);
  };

  onMouseOut = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.Mouseout, e);
  };

  onMouseDown = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.Dragstart, e);
  };

  onDragging = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.Dragging, e);
  };

  onDragEnd = debounce((e: ISceneMouseEvent) => {
    this.emit(RenderEvent.Dragend, e);
  }, 0);

  onUnClick = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.UnClick, e);
  };

  enableHover = () => {
    this.disableHover();
    this.layers[0]?.on(LayerEvent.Mousemove, this.onMouseMove);
    this.layers[0]?.on(LayerEvent.Mouseout, this.onMouseOut);
  };

  disableHover = () => {
    this.layers[0]?.off(LayerEvent.Mousemove, this.onMouseMove);
    this.layers[0]?.off(LayerEvent.Mouseout, this.onMouseOut);
  };

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

  enableUnClick() {
    this.disableUnClick();
    this.layers[0].on(LayerEvent.UnClick, this.onUnClick);
  }

  disableUnClick() {
    this.layers[0].off(LayerEvent.UnClick, this.onUnClick);
  }
}
