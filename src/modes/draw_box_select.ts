import { IInteractionTarget, ILngLat, Scene } from '@antv/l7';
import DrawEmptyLayer from '../render/draw_empty';
import { DrawEvent, DrawModes } from '../util/constant';
import { createRect } from '../util/create_geometry';
import {
  Feature,
  featureCollection,
  Geometries,
  Properties,
} from '@turf/helpers';
import DrawFeature, { IDrawFeatureOption } from './draw_feature';

export default class DrawBoxSelect extends DrawFeature {
  protected startPoint: ILngLat;
  protected endPoint: ILngLat;

  public drawFinish(): void {}
  protected moveFeature(e: ILngLat): void {}
  protected editFeature(e: any): void {}
  protected hideOtherLayer(): void {}
  protected removeLatestVertex(): void {}
  protected showOtherLayer(): void {}
  constructor(scene: Scene, options: Partial<IDrawFeatureOption> = {}) {
    super(scene, options);
    this.drawDistanceLayer = new DrawEmptyLayer(this);
    this.drawLayer.styleVariant = 'boxSelect';
  }

  protected onDragStart(e: IInteractionTarget) {
    if (this.drawStatus !== 'Drawing') {
      this.drawLayer.emit('unclick', null);
    }
    this.startPoint = e.lngLat;
    this.setCursor('crosshair');
  }

  protected onDragging(e: IInteractionTarget) {
    this.endPoint = e.lngLat;
    const feature = this.createFeature() as Feature<Geometries, Properties>;
    this.drawLayer.update(featureCollection([feature]));
  }

  protected onDragEnd() {
    // this.drawLayer.update(featureCollection([feature]));
    this.drawLayer.update(featureCollection([]));

    // this.emit(DrawEvent.MODE_CHANGE, DrawModes.SIMPLE_SELECT);

    this.emit(DrawEvent.BOX_SELECT, {
      startPoint: this.startPoint,
      endPoint: this.endPoint,
    });

    this.disable();
  }

  protected createFeature(id: string = '0'): Feature {
    const feature = createRect(
      [this.startPoint.lng, this.startPoint.lat],
      [this.endPoint.lng, this.endPoint.lat],
      {
        id,
        pointFeatures: [],
      },
    );
    // this.setCurrentFeature(feature as Feature);
    return feature;
  }
}
