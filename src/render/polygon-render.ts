import { BaseRender } from '../render';
import {
  ILayerMouseEvent,
  ILineFeature,
  IPolygonFeature,
  IPolygonStyle,
} from '../typings';
import { ILayer, PolygonLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { RenderEvent } from '../constant';

export class PolygonRender extends BaseRender<IPolygonFeature, IPolygonStyle> {
  getLayers(): ILayer[] {
    const { normal, hover, active, style } = this.style;
    const polygonLayer = new PolygonLayer({
      blend: 'normal',
    });

    polygonLayer
      .source(featureCollection([]))
      .color('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.color : isHover ? hover.color : normal.color;
      })
      .style(style);

    return [polygonLayer];
  }

  onMouseMove = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.mousemove, e);
  };

  onMouseOut = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.mouseout, e);
  };

  onMouseDown = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.dragstart, e);
  };

  onDragging = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.dragging, e);
  };

  onDragEnd = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.dragend, e);
  };

  onUnClick = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.unclick, e);
  };

  enableHover = () => {
    this.layers[0]?.on('mousemove', this.onMouseMove);
    this.layers[0]?.on('mouseout', this.onMouseOut);
  };

  disableHover = () => {
    this.layers[0]?.off('mousemove', this.onMouseMove);
    this.layers[0]?.off('mouseout', this.onMouseOut);
  };

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

  enableUnClick() {
    this.disableUnClick();
    this.layers[0].on('unclick', this.onUnClick);
  }

  disableUnClick() {
    this.layers[0].on('unclick', this.onUnClick);
  }
}
