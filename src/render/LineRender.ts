import { BaseRender } from './BaseRender';
import { ILayerMouseEvent, ILineFeature, ILineStyle } from '../typings';
import { ILayer, LineLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { RenderEvent } from '../constants';

export class LineRender extends BaseRender<ILineFeature, ILineStyle> {
  initLayers(): ILayer[] {
    const { normal, hover, active, style } = this.style;

    const layer = new LineLayer({
      blend: 'normal',
    })
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
    this.emit(RenderEvent.mousemove, e);
  };

  onMouseOut = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.mouseout, e);
  };

  onMouseDown = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.mousedown, e);
  };

  onDragging = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.dragging, e);
  };

  onDragEnd = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.dragend, e);
  };

  onUnClick = (e: ILayerMouseEvent<ILineFeature>) => {
    this.emit(RenderEvent.unClick, e);
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
    this.scene.on('dragend', this.onDragEnd);
  }

  disableDrag() {
    this.layers[0].off('mousedown', this.onMouseDown);
    this.scene.off('dragging', this.onDragging);
    this.scene.off('dragend', this.onDragEnd);
  }

  enableUnClick() {
    this.disableUnClick();
    this.layers[0].on('unclick', this.onUnClick);
  }

  disableUnClick() {
    this.layers[0].on('unclick', this.onUnClick);
  }
}
