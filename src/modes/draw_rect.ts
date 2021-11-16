import { Scene } from '@antv/l7';
import { Feature } from '@turf/helpers';
import { DrawModes } from '../util/constant';
import { createPoint, createRect } from '../util/create_geometry';
import DrawCircle from './draw_circle';
import { IDrawFeatureOption } from './draw_feature';
export default class DrawRect extends DrawCircle {
  constructor(scene: Scene, options: Partial<IDrawFeatureOption> = {}) {
    super(scene, options);
    this.type = 'rect';
    this.setDrawMode(DrawModes.DRAW_Rect);
  }
  public drawFinish() {
    return null;
  }
  protected initData() {
    console.log('初始化', this.source?.initData);
    if (this.source?.initData?.type === 'rect') {
      const feature = this.source.initData.features;
      this.startPoint = {
        lng: feature[0][0],
        lat: feature[0][1],
      };
      this.endPoint = {
        lng: feature[1][0],
        lat: feature[1][1],
      };

      this.source.data = {
        features: [this.createFeature('0', false)],
        type: 'FeatureCollection',
      };
      return true;
    }
    return false;
  }
  protected getDefaultOptions(): Partial<IDrawFeatureOption> {
    return {
      ...super.getDefaultOptions(),
      title: '绘制矩形',
    };
  }

  protected createFeature(id: string = '0', active: boolean = true): Feature {
    const points = createPoint([this.startPoint, this.endPoint]);

    const feature = createRect(
      [this.startPoint.lng, this.startPoint.lat],
      [this.endPoint.lng, this.endPoint.lat],
      {
        id,
        active,
        pointFeatures: points.features,
      },
    );
    this.setCurrentFeature(feature as Feature);
    return feature;
  }
}
