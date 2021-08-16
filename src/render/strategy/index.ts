import { ILayer } from '@antv/l7';
import { FeatureCollection } from '@turf/helpers';
import RenderLineStrategy from './renderLineStrategy';
import RenderPointStrategy from './renderPoint';
import RenderPolygonStrategy from './renderPolygon';
import RenderTextStrategy from './renderText';

export interface IRenderStrategy {
  /**
   * layerstyle.ts 中的feature类型
   */
  styleVariant: string;

  execute: (fe: FeatureCollection, styles: any) => ILayer[];
}

export {
  RenderLineStrategy,
  RenderPointStrategy,
  RenderPolygonStrategy,
  RenderTextStrategy,
};
