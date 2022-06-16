import { LayerRender } from './layer-render';
import { ILayer, PointLayer } from '@antv/l7';
import { ILayerMouseEvent, IMidPointFeature, IMidPointStyle } from '../typings';
import { featureCollection } from '@turf/turf';
import { LayerEvent, RenderEvent } from '../constant';

export class MidPointRender extends LayerRender<
  IMidPointFeature,
  IMidPointStyle
> {
  getLayers(): ILayer[] {
    const { normal, style, options } = this.style;
    const { shape, size, color, borderColor, borderWidth } = normal;
    const layer = new PointLayer(options ?? {})
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

  onMouseDown = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.click, e);
  };

  enableClick() {
    this.disableClick();
    this.layers[0].on(LayerEvent.mousedown, this.onMouseDown);
  }

  disableClick() {
    this.layers[0].off(LayerEvent.mousedown, this.onMouseDown);
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
}
