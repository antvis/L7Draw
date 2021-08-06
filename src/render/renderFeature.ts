import { ILayer, LineLayer, PointLayer, PolygonLayer } from '@antv/l7';
import { FeatureCollection } from '@turf/helpers';
import { flatten } from 'lodash';
import { IRenderStrategy, Singleton } from './renderStrategy';

export default class RenderFeature {
  private strategyMap: { [K in string]: IRenderStrategy[] };

  constructor() {
    this.strategyMap = {};
  }

  static defaultRenderer(): RenderFeature {
    const instance = new RenderFeature();
    instance.setStrategy(RenderPointStrategy.getInstance(), 'Point');
    instance.setStrategy(RenderTextStrategy.getInstance(), 'Point');
    instance.setStrategy(RenderPolygonStrategy.getInstance(), 'Polygon');
    instance.setStrategy(RenderLineStrategy.getInstance(), 'LineString');
    return instance;
  }

  setStrategy(strategy: IRenderStrategy, featureType: string): void {
    const current = this.strategyMap[featureType];
    this.strategyMap[featureType] = (current || []).concat(strategy);
  }

  renderFeature(fe: FeatureCollection, style: any): ILayer[] {
    const type = fe.features[0]?.geometry?.type;
    const strategies = this.strategyMap[type] || [];
    const layers = strategies.map(stragegy => stragegy.execute(fe, style));
    return flatten(layers);
  }
}

class RenderTextStrategy extends Singleton implements IRenderStrategy {
  styleVariant = 'point';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    // only render if feature properties contains value attribute
    if (!fe.features[0]?.properties?.value) return [];

    const layer = new PointLayer({
      zIndex: 2,
      pickingBuffer: 3,
    })
      .source(fe)
      .style(style.style)
      .shape('value', 'text')
      .size(14)
      .color(style.color);

    return [layer];
  }
}

class RenderPointStrategy extends Singleton implements IRenderStrategy {
  styleVariant = 'point';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    // 有值时用文字渲染
    if (fe.features[0]?.properties?.value) return [];

    const layer = new PointLayer({
      zIndex: 2,
      pickingBuffer: 3,
    })
      .source(fe)
      .shape('circle')
      .color(style.color)
      .size(style.size)
      .style(style.style);
    return [layer];
  }
}

class RenderLineStrategy extends Singleton implements IRenderStrategy {
  styleVariant = 'line';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    const layer = new LineLayer({
      pickingBuffer: 3,
    })
      .source(fe)
      .shape('line')
      .color(style.color)
      .size(style.size)
      .style(style.style)
      .active(style.active || {});

    layer.setBlend('max');

    return [layer];
  }
}

class RenderPolygonStrategy extends Singleton implements IRenderStrategy {
  styleVariant = 'polygon';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    const fill = new PolygonLayer()
      .source(fe)
      .shape('fill')
      .color(style.color)
      .size(style.size)
      .style({
        opacity: style.style.opacity,
      })
      .active(style.active || {});

    const line = new PolygonLayer()
      .source(fe)
      .shape('line')
      .color(style.style.stroke)
      .size(style.style.strokeWidth)
      .style({
        opacity: style.style.strokeOpacity,
        lineType: style.style.lineType,
        dashArray: style.style.dashArray,
      })
      .active(style.active || {});

    line.setBlend('max');

    return [fill, line];
  }
}
