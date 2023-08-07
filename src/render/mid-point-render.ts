import { ILayer, PointLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { LayerEvent, RenderEvent } from '../constant';
import { ILayerMouseEvent, IMidPointFeature, IMidPointStyle } from '../typings';
import { LayerRender } from './layer-render';

export class MidPointRender extends LayerRender<
  IMidPointFeature,
  IMidPointStyle
> {
  initLayers(): ILayer[] {
    const { normal, style = {}, options } = this.style;
    const { shape, size, color } = normal;
    const layer = new PointLayer(options ?? {})
      .source(featureCollection([]))
      .size(size)
      .color(color)
      .shape(shape)
      .style(style);

    return [layer];
  }

  onMouseMove = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.Mousemove, e);
  };

  onMouseOut = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.Mouseout, e);
  };

  onMouseDown = (e: ILayerMouseEvent) => {
    this.emit(RenderEvent.Click, e);
  };

  enableClick() {
    this.disableClick();
    this.layers[0].on(LayerEvent.Mousedown, this.onMouseDown);
  }

  disableClick() {
    this.layers[0].off(LayerEvent.Mousedown, this.onMouseDown);
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
}
