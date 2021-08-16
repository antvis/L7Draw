import { IInteractionTarget, ILngLat, Scene } from '@antv/l7';
import { Feature, featureCollection, point } from '@turf/helpers';
import { DrawEvent, DrawModes } from '../util/constant';
import { IDrawFeatureOption } from './draw_feature';
import DrawMode from './draw_mode';

const InitFeature = {
  type: 'FeatureCollection',
  features: [],
};
export default class DrawMeasure extends DrawMode {
  constructor(scene: Scene, options: Partial<IDrawFeatureOption> = {}) {
    super(scene, options);
  }

  public setSelectedFeature(feature: Feature) {
    this.currentFeature = feature;
    this.emit(DrawEvent.MEASURE, this.currentFeature);
  }

  protected onDragStart(e: IInteractionTarget) {}

  protected getDefaultOptions(): Partial<IDrawFeatureOption> {
    return {
      steps: 64,
      units: 'kilometers',
      cursor: 'move',
    };
  }

  protected onDragging(e: IInteractionTarget) {}

  protected onDragEnd() {}
  protected onClick() {}
}
