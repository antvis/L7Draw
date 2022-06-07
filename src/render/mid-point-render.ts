import { BaseRender } from './base-render';
import { ILayer, PointLayer } from '@antv/l7';
import {
  ILayerMouseEvent,
  IMidPointFeature,
  IMidPointStyle,
  IPointFeature,
  IPointStyle,
  ISceneMouseEvent,
} from '../typings';
import { featureCollection } from '@turf/turf';
import { RenderEvent } from '../constant';

export class MidPointRender extends BaseRender<IMidPointFeature, IMidPointStyle> {
  getLayers(): ILayer[] {
    const { normal, style } = this.style;
    const { shape, size, color, borderColor, borderWidth } = normal;
    const layer = new PointLayer({
      blend: 'normal',
    })
      .source(featureCollection([]))
      .size(size)
      .color(color)
      .shape(shape)
      .style({
        stroke: borderColor,
        strokeWidth: borderWidth,
        ...style,
      });

    return [layer];
  }

  onMouseMove = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.mousemove, e);
  };

  onMouseOut = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.mouseout, e);
  };

  onClick = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.click, e);
  };

  enableClick() {
    this.disableClick();
    this.layers[0].on('click', this.onClick);
  }

  disableClick() {
    this.layers[0].off('click', this.onClick);
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
}
