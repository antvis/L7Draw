import {
  DeepPartial,
  IDrawerOptions,
  ILineFeature,
  IRenderType,
} from '../typings';
import { BaseDrawer } from './common/BaseDrawer';
import { Scene } from '@antv/l7';
import { PointDrawer } from './PointDrawer';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends BaseDrawer<ILineDrawerOptions, ILineFeature> {
  pointDrawer: PointDrawer;
  // midPointDrawer: PointDrawer;

  constructor(scene: Scene, options?: DeepPartial<ILineDrawerOptions>) {
    super(scene, options);

    this.pointDrawer = new PointDrawer(scene, options);
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
  }

  disable() {
    super.disable();

    this.pointDrawer.disable();
  }

  bindEvent() {}

  unbindEvent() {}

  setData(
    updater: ILineFeature[] | ((_: ILineFeature[]) => ILineFeature[]),
    store = false,
  ) {}
}
