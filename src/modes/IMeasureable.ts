import BaseRenderLayer from '../render/base_render';
import { Feature } from '@turf/helpers';

export interface IMeasureable {
  drawRulerLayer: BaseRenderLayer;

  onMeasure(feature: Feature): void;
  enableMeasure(): void;
  disableMeasure(): void;
}
