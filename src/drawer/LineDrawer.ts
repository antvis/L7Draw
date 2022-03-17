import {
  DeepPartial,
  IDrawerOptions,
  ILineFeature,
  IRenderType,
} from '../typings';
import { BaseDrawer } from './BaseDrawer';
import { Scene } from '@antv/l7';
import { PointDrawer } from './PointDrawer';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends BaseDrawer<ILineDrawerOptions> {
  pointDrawer: PointDrawer;
  // midPointDrawer: PointDrawer;

  constructor(scene: Scene, options?: DeepPartial<ILineDrawerOptions>) {
    super(scene, options);

    this.pointDrawer = new PointDrawer(scene, options);
    // this.midPointDrawer = new PointDrawer(scene, options);
  }

  getData(): ILineFeature[] {
    return [];
  }

  getDefaultOptions(): ILineDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  getRenderList(): IRenderType[] {
    return ['line', 'point', 'midPoint'];
  }

  enable() {
    super.enable();

    this.pointDrawer.enable();
    // this.midPointDrawer.enable();
  }

  disable() {
    super.disable();

    this.pointDrawer.disable();
    // this.midPointDrawer.disable();
  }

  bindEvent() {}

  unbindEvent() {}
}
