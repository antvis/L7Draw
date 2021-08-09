import { ILayer, LineLayer, PointLayer, PolygonLayer } from '@antv/l7';
import { FeatureCollection } from '@turf/helpers';
import { flatten } from 'lodash';
import {
  IRenderStrategy,
  RenderLineStrategy,
  RenderPointStrategy,
  RenderPolygonStrategy,
  RenderTextStrategy,
} from './strategy';

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
